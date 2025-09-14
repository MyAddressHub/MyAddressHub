"""
Celery tasks for the addresses app.
"""

from celery import shared_task
from .batch_sync import BatchSyncManager


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def sync_addresses_to_blockchain(self, batch_size: int = 10):
    """
    Sync pending addresses to blockchain.
    """
    try:
        sync_manager = BatchSyncManager(batch_size=batch_size)
        pending_addresses = sync_manager.get_pending_addresses()
        
        if not pending_addresses:
            return {
                'success': True,
                'message': 'No pending addresses to sync',
                'processed': 0
            }
        
        # Prepare batch data
        batch_data = sync_manager.prepare_batch_data(pending_addresses)
        
        # Sync to blockchain
        results = sync_manager.sync_batch_to_blockchain(batch_data)
        
        return {
            'success': True,
            'processed': len(pending_addresses),
            'results': results
        }
        
    except Exception as exc:
        print(f"Error in sync_addresses_to_blockchain: {exc}")
        raise self.retry(exc=exc)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def update_addresses_on_blockchain(self, batch_size: int = 10):
    """
    Update existing addresses on blockchain.
    """
    try:
        sync_manager = BatchSyncManager(batch_size=batch_size)
        updated_addresses = sync_manager.get_updated_addresses()
        
        if not updated_addresses:
            return {
                'success': True,
                'message': 'No addresses to update',
                'processed': 0
            }
        
        # Prepare batch data
        batch_data = sync_manager.prepare_batch_data(updated_addresses)
        
        # Sync to blockchain
        results = sync_manager.sync_batch_to_blockchain(batch_data)
        
        return {
            'success': True,
            'processed': len(updated_addresses),
            'results': results
        }
        
    except Exception as exc:
        print(f"Error in update_addresses_on_blockchain: {exc}")
        raise self.retry(exc=exc)


@shared_task
def schedule_batch_sync():
    """
    Schedule batch synchronization tasks.
    This should be called by Celery Beat periodically.
    """
    try:
        from .models import Address
        
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
