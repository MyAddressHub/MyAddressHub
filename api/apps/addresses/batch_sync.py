"""
Batch synchronization for blockchain operations.
"""

import time
from typing import List, Dict, Any
from django.db import transaction
from celery import shared_task
from celery.exceptions import Retry
from .models import Address
from .blockchain import blockchain_manager
from .encryption import decrypt_address_data


class BatchSyncManager:
    """
    Manages batch synchronization of addresses to blockchain.
    """
    
    def __init__(self, batch_size: int = 10, max_retries: int = 3):
        self.batch_size = batch_size
        self.max_retries = max_retries
    
    def get_pending_addresses(self) -> List[Address]:
        """
        Get addresses that need to be synced to blockchain.
        
        Returns:
            List of Address objects that need blockchain sync
        """
        return Address.objects.filter(
            is_active=True,
            is_stored_on_blockchain=False
        ).select_related('user')[:self.batch_size]
    
    def get_updated_addresses(self) -> List[Address]:
        """
        Get addresses that have been updated and need blockchain sync.
        
        Returns:
            List of Address objects that need blockchain update
        """
        # This would need a field to track when addresses were last updated
        # For now, we'll use a simple approach
        return Address.objects.filter(
            is_active=True,
            is_stored_on_blockchain=True
        ).select_related('user')[:self.batch_size]
    
    def prepare_batch_data(self, addresses: List[Address]) -> List[Dict[str, Any]]:
        """
        Prepare address data for batch blockchain operations.
        
        Args:
            addresses: List of Address objects
            
        Returns:
            List of dictionaries containing address data
        """
        batch_data = []
        
        for address in addresses:
            try:
                # Decrypt address data
                decrypted_data = decrypt_address_data({
                    'address': address.address or '',
                    'street': address.street or '',
                    'suburb': address.suburb or '',
                    'state': address.state or '',
                    'postcode': address.postcode or ''
                })
                
                # Prepare data for blockchain
                address_data = {
                    'id': str(address.id),
                    'address_name': address.address_name,
                    'is_default': address.is_default,
                    'is_active': address.is_active,
                    **decrypted_data
                }
                
                batch_data.append({
                    'address': address,
                    'data': address_data,
                    'user_wallet': self._get_user_wallet(address.user)
                })
                
            except Exception as e:
                print(f"Error preparing address {address.id} for batch sync: {e}")
                continue
        
        return batch_data
    
    def _get_user_wallet(self, user) -> str:
        """
        Get user's wallet address.
        For now, use a default wallet. In production, this would be user's actual wallet.
        
        Args:
            user: User object
            
        Returns:
            Wallet address string
        """
        # TODO: Implement user wallet management
        return "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
    
    def sync_batch_to_blockchain(self, batch_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Sync a batch of addresses to blockchain.
        
        Args:
            batch_data: List of address data dictionaries
            
        Returns:
            Dictionary with sync results
        """
        if not blockchain_manager.is_connected():
            return {
                'success': False,
                'error': 'Blockchain not connected',
                'processed': 0,
                'failed': len(batch_data)
            }
        
        results = {
            'success': True,
            'processed': 0,
            'failed': 0,
            'errors': []
        }
        
        for item in batch_data:
            try:
                address = item['address']
                address_data = item['data']
                user_wallet = item['user_wallet']
                
                # Store on blockchain
                result = blockchain_manager.store_address_on_blockchain(address_data, user_wallet)
                
                if result.get('success'):
                    # Update address with blockchain metadata
                    with transaction.atomic():
                        from django.utils import timezone
                        address.blockchain_tx_hash = result.get('transaction_hash')
                        address.blockchain_block_number = result.get('block_number')
                        address.is_stored_on_blockchain = True
                        address.last_synced_at = timezone.now()
                        address.save(update_fields=[
                            'blockchain_tx_hash',
                            'blockchain_block_number',
                            'is_stored_on_blockchain',
                            'last_synced_at'
                        ])
                    
                    results['processed'] += 1
                else:
                    results['failed'] += 1
                    results['errors'].append(f"Address {address.id}: {result.get('error', 'Unknown error')}")
                    
            except Exception as e:
                results['failed'] += 1
                results['errors'].append(f"Address {item['address'].id}: {str(e)}")
        
        if results['failed'] > 0:
            results['success'] = False
        
        return results


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def sync_addresses_to_blockchain(self, batch_size: int = 10):
    """
    Celery task to sync addresses to blockchain in batches.
    
    Args:
        batch_size: Number of addresses to process in each batch
        
    Returns:
        Dictionary with sync results
    """
    try:
        sync_manager = BatchSyncManager(batch_size=batch_size)
        
        # Get pending addresses
        pending_addresses = sync_manager.get_pending_addresses()
        
        if not pending_addresses:
            return {
                'success': True,
                'message': 'No addresses to sync',
                'processed': 0,
                'failed': 0
            }
        
        # Prepare batch data
        batch_data = sync_manager.prepare_batch_data(pending_addresses)
        
        if not batch_data:
            return {
                'success': True,
                'message': 'No valid addresses to sync',
                'processed': 0,
                'failed': 0
            }
        
        # Sync to blockchain
        results = sync_manager.sync_batch_to_blockchain(batch_data)
        
        # If there were failures and we haven't exceeded max retries, retry
        if not results['success'] and self.request.retries < self.max_retries:
            raise Retry(countdown=60 * (2 ** self.request.retries))
        
        return results
        
    except Exception as e:
        # Log the error and retry if possible
        print(f"Batch sync error: {e}")
        
        if self.request.retries < self.max_retries:
            raise Retry(countdown=60 * (2 ** self.request.retries))
        
        return {
            'success': False,
            'error': str(e),
            'processed': 0,
            'failed': batch_size
        }


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def update_addresses_on_blockchain(self, batch_size: int = 10):
    """
    Celery task to update addresses on blockchain in batches.
    
    Args:
        batch_size: Number of addresses to process in each batch
        
    Returns:
        Dictionary with update results
    """
    try:
        sync_manager = BatchSyncManager(batch_size=batch_size)
        
        # Get updated addresses
        updated_addresses = sync_manager.get_updated_addresses()
        
        if not updated_addresses:
            return {
                'success': True,
                'message': 'No addresses to update',
                'processed': 0,
                'failed': 0
            }
        
        # Prepare batch data
        batch_data = sync_manager.prepare_batch_data(updated_addresses)
        
        if not batch_data:
            return {
                'success': True,
                'message': 'No valid addresses to update',
                'processed': 0,
                'failed': 0
            }
        
        # Update on blockchain
        results = sync_manager.sync_batch_to_blockchain(batch_data)
        
        # If there were failures and we haven't exceeded max retries, retry
        if not results['success'] and self.request.retries < self.max_retries:
            raise Retry(countdown=60 * (2 ** self.request.retries))
        
        return results
        
    except Exception as e:
        # Log the error and retry if possible
        print(f"Batch update error: {e}")
        
        if self.request.retries < self.max_retries:
            raise Retry(countdown=60 * (2 ** self.request.retries))
        
        return {
            'success': False,
            'error': str(e),
            'processed': 0,
            'failed': batch_size
        }


@shared_task
def schedule_batch_sync():
    """
    Schedule batch synchronization tasks.
    This should be called by Celery Beat periodically.
    """
    try:
        # Check if there are addresses to sync
        pending_count = Address.objects.filter(
            is_active=True,
            is_stored_on_blockchain=False
        ).count()
        
        if pending_count > 0:
            # Queue sync task
            sync_addresses_to_blockchain.delay(batch_size=10)
            print(f"Queued batch sync for {pending_count} pending addresses")
        
        # Check if there are addresses to update
        updated_count = Address.objects.filter(
            is_active=True,
            is_stored_on_blockchain=True
        ).count()
        
        if updated_count > 0:
            # Queue update task
            update_addresses_on_blockchain.delay(batch_size=10)
            print(f"Queued batch update for {updated_count} addresses")
        
        return {
            'success': True,
            'pending_synced': pending_count,
            'updated_synced': updated_count
        }
        
    except Exception as e:
        print(f"Error scheduling batch sync: {e}")
        return {
            'success': False,
            'error': str(e)
        }
