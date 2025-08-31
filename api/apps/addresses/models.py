"""
Address models for MyAddressHub.
"""

import uuid
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from .blockchain import blockchain_manager


class Address(models.Model):
    """
    Address model for storing user addresses with UUID.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    address_name = models.CharField(max_length=255, help_text="A name for this address (e.g., 'Home', 'Work')")
    
    # Address breakdown
    address = models.TextField(help_text="Full address")
    street = models.CharField(max_length=255, help_text="Street address")
    suburb = models.CharField(max_length=255, help_text="Suburb/City")
    state = models.CharField(max_length=100, help_text="State/Province")
    postcode = models.CharField(
        max_length=10, 
        help_text="Postal/ZIP code",
        validators=[
            RegexValidator(
                regex=r'^[0-9A-Za-z\s\-]+$',
                message='Postcode can only contain letters, numbers, spaces, and hyphens.'
            )
        ]
    )
    
    # Blockchain storage fields
    blockchain_tx_hash = models.CharField(max_length=66, blank=True, null=True, help_text="Blockchain transaction hash")
    blockchain_block_number = models.BigIntegerField(blank=True, null=True, help_text="Block number where address was stored")
    ipfs_hash = models.CharField(max_length=100, blank=True, null=True, help_text="IPFS hash for additional data")
    is_stored_on_blockchain = models.BooleanField(default=False, help_text="Whether address is stored on blockchain")
    
    # Metadata
    is_default = models.BooleanField(default=False, help_text="Mark as default address")
    is_active = models.BooleanField(default=True, help_text="Address is active")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'addresses'
        ordering = ['-created_at']
        verbose_name = 'Address'
        verbose_name_plural = 'Addresses'
        # Ensure only one default address per user
        constraints = [
            models.UniqueConstraint(
                fields=['user', 'is_default'],
                condition=models.Q(is_default=True),
                name='unique_default_address_per_user'
            )
        ]
    
    def __str__(self):
        return f"{self.address_name} - {self.user.email}"
    
    def save(self, *args, **kwargs):
        # If this address is being set as default, unset other defaults for this user
        if self.is_default:
            Address.objects.filter(user=self.user, is_default=True).exclude(pk=self.pk).update(is_default=False)
        
        # Check if this is a new address or if address data has changed
        is_new = self.pk is None
        if not is_new:
            try:
                old_instance = Address.objects.get(pk=self.pk)
                address_changed = (
                    old_instance.address != self.address or
                    old_instance.street != self.street or
                    old_instance.suburb != self.suburb or
                    old_instance.state != self.state or
                    old_instance.postcode != self.postcode or
                    old_instance.address_name != self.address_name or
                    old_instance.is_default != self.is_default
                )
            except Address.DoesNotExist:
                address_changed = True
        else:
            address_changed = True
        
        # Save to database first
        super().save(*args, **kwargs)
        
        # Store on blockchain if address data changed and blockchain is available
        if address_changed and blockchain_manager.is_connected():
            try:
                self._store_on_blockchain()
            except Exception as e:
                print(f"Warning: Failed to store address on blockchain: {e}")
    
    def _store_on_blockchain(self):
        """Store address data on blockchain."""
        if not blockchain_manager.is_connected():
            return
        
        try:
            # Prepare address data for blockchain
            address_data = {
                'id': str(self.id),
                'address_name': self.address_name,
                'address': self.address,
                'street': self.street,
                'suburb': self.suburb,
                'state': self.state,
                'postcode': self.postcode,
                'is_default': self.is_default,
                'is_active': self.is_active
            }
            
            # For now, use a default wallet address (in production, this would be user's wallet)
            user_wallet = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
            
            # Store on blockchain
            result = blockchain_manager.store_address_on_blockchain(address_data, user_wallet)
            
            if result.get('success'):
                self.blockchain_tx_hash = result.get('transaction_hash')
                self.blockchain_block_number = result.get('block_number')
                self.is_stored_on_blockchain = True
                
                # Store additional metadata on IPFS
                metadata = {
                    'user_id': self.user.id,
                    'user_email': self.user.email,
                    'created_at': self.created_at.isoformat(),
                    'updated_at': self.updated_at.isoformat()
                }
                
                ipfs_hash = blockchain_manager.store_on_ipfs(metadata)
                if ipfs_hash:
                    self.ipfs_hash = ipfs_hash
                
                # Save blockchain info without triggering save again
                Address.objects.filter(pk=self.pk).update(
                    blockchain_tx_hash=self.blockchain_tx_hash,
                    blockchain_block_number=self.blockchain_block_number,
                    is_stored_on_blockchain=self.is_stored_on_blockchain,
                    ipfs_hash=self.ipfs_hash
                )
                
        except Exception as e:
            print(f"Error storing address on blockchain: {e}")
    
    def delete_from_blockchain(self):
        """Delete address from blockchain."""
        if not blockchain_manager.is_connected() or not self.is_stored_on_blockchain:
            return
        
        try:
            # For now, use a default wallet address
            user_wallet = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
            
            # Convert UUID to bytes32
            address_id_bytes = blockchain_manager.w3.to_bytes(hexstr=str(self.id).replace('-', ''))
            
            # Build delete transaction
            tx = blockchain_manager.contract.functions.deleteAddress(address_id_bytes).build_transaction({
                'from': user_wallet,
                'gas': 2000000,
                'gasPrice': blockchain_manager.w3.eth.gas_price,
                'nonce': blockchain_manager.w3.eth.get_transaction_count(user_wallet)
            })
            
            # For development, simulate the transaction
            result = {
                'success': True,
                'transaction_hash': f"0x{uuid.uuid4().hex}",
                'block_number': blockchain_manager.w3.eth.block_number,
                'message': 'Address deleted from blockchain (simulated)'
            }
            
            if result.get('success'):
                # Update the model to reflect deletion from blockchain
                self.is_stored_on_blockchain = False
                self.blockchain_tx_hash = result.get('transaction_hash')
                self.blockchain_block_number = result.get('block_number')
                
                # Save without triggering save method again
                Address.objects.filter(pk=self.pk).update(
                    is_stored_on_blockchain=False,
                    blockchain_tx_hash=self.blockchain_tx_hash,
                    blockchain_block_number=self.blockchain_block_number
                )
                
        except Exception as e:
            print(f"Error deleting address from blockchain: {e}")
    
    def soft_delete(self):
        """Soft delete the address (mark as inactive and delete from blockchain)."""
        self.is_active = False
        self.save()
        
        # Delete from blockchain
        self.delete_from_blockchain()
    
    @property
    def full_address(self):
        """Return the complete formatted address."""
        return f"{self.address}, {self.street}, {self.suburb}, {self.state} {self.postcode}"
    
    @property
    def address_breakdown(self):
        """Return address breakdown as a dictionary."""
        return {
            'address': self.address,
            'street': self.street,
            'suburb': self.suburb,
            'state': self.state,
            'postcode': self.postcode
        } 