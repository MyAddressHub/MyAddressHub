"""
Address models for MyAddressHub.
"""

import uuid
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator
from .blockchain import blockchain_manager
from .encryption import encrypt_address_data, decrypt_address_data


class Address(models.Model):
    """
    Address model for storing address metadata with UUID.
    Address data itself is stored on blockchain.
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='addresses')
    address_name = models.CharField(max_length=255, help_text="A name for this address (e.g., 'Home', 'Work')")
    
    # Blockchain storage fields - needed for efficient fetching and management
    blockchain_tx_hash = models.CharField(max_length=66, blank=True, null=True, help_text="Blockchain transaction hash")
    blockchain_block_number = models.BigIntegerField(blank=True, null=True, help_text="Block number where address was stored")
    ipfs_hash = models.CharField(max_length=100, blank=True, null=True, help_text="IPFS hash for additional data")
    is_stored_on_blockchain = models.BooleanField(default=False, help_text="Whether address is stored on blockchain")
    last_synced_at = models.DateTimeField(blank=True, null=True, help_text="When this address was last synced to blockchain")
    
    # Address data fields - encrypted in database for security
    address = models.TextField(blank=True, null=True, help_text="Encrypted address line")
    street = models.TextField(blank=True, null=True, help_text="Encrypted street name")
    suburb = models.TextField(blank=True, null=True, help_text="Encrypted suburb/city")
    state = models.TextField(blank=True, null=True, help_text="Encrypted state/province")
    postcode = models.TextField(blank=True, null=True, help_text="Encrypted postal code")
    
    # Metadata only
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
        try:
            if hasattr(self, 'user') and self.user:
                if isinstance(self.user, User):
                    return f"{self.address_name} - {self.user.email}"
                elif hasattr(self.user, 'email'):
                    return f"{self.address_name} - {self.user.email}"
                else:
                    return f"{self.address_name} - User ID: {self.user}"
            elif hasattr(self, 'user_id') and self.user_id:
                return f"{self.address_name} - User ID: {self.user_id}"
            else:
                return f"{self.address_name} - No User"
        except:
            return f"{self.address_name} - Unknown User"
    
    def save(self, *args, **kwargs):
        # If this address is being set as default, unset other defaults for this user
        if self.is_default:
            actual_user = None
            try:
                # Try to get the user object
                if hasattr(self, 'user_id') and self.user_id:
                    actual_user = User.objects.get(pk=self.user_id)
                elif hasattr(self, 'user') and self.user:
                    if isinstance(self.user, User):
                        actual_user = self.user
                    elif isinstance(self.user, (str, int)):
                        actual_user = User.objects.get(pk=self.user)
                    elif hasattr(self.user, 'id'):  # Handle request.user objects
                        actual_user = self.user
            except (User.DoesNotExist, ValueError, AttributeError) as e:
                print(f"Warning: Cannot get user for default address update: {e}")
                actual_user = None
            
            if actual_user:
                Address.objects.filter(user=actual_user, is_default=True).exclude(pk=self.pk).update(is_default=False)
            else:
                print(f"Error: Cannot determine user for default address update. self.user: {getattr(self, 'user', 'None')}, self.user_id: {getattr(self, 'user_id', 'None')}")
        
        # Check if this is a new address or if metadata/blockchain data has changed
        is_new = self.pk is None
        metadata_changed = False
        blockchain_data_changed = False

        if not is_new:
            try:
                old_instance = Address.objects.get(pk=self.pk)
                metadata_changed = (
                    old_instance.address_name != self.address_name or
                    old_instance.is_default != self.is_default or
                    old_instance.is_active != self.is_active
                )
                blockchain_data_changed = self._has_blockchain_data_changed(old_instance)
            except Address.DoesNotExist:
                metadata_changed = True # Treat as new if old instance not found
                blockchain_data_changed = True
        else:
            metadata_changed = True
            blockchain_data_changed = True # New address, so blockchain data is new

        # Encrypt address data before saving
        self._encrypt_address_data()
        
        # Save metadata to database first
        super().save(*args, **kwargs)
        
        # Store address data on blockchain if it's new or changed and blockchain is available
        # Note: For new addresses, blockchain storage is handled in the serializer
        if not is_new and blockchain_data_changed and blockchain_manager.is_connected():
            try:
                # Get address data from temporary attributes if available
                address_data = None
                if hasattr(self, '_address') or hasattr(self, '_street') or hasattr(self, '_suburb') or hasattr(self, '_state_value') or hasattr(self, '_postcode'):
                    address_data = {
                        'address': getattr(self, '_address', ''),
                        'street': getattr(self, '_street', ''),
                        'suburb': getattr(self, '_suburb', ''),
                        'state': getattr(self, '_state_value', ''),
                        'postcode': getattr(self, '_postcode', '')
                    }
                self._store_on_blockchain(address_data)
            except Exception as e:
                print(f"Warning: Failed to store address on blockchain: {e}")
    
    def _store_on_blockchain(self, address_data=None):
        """Store address data on blockchain."""
        if not blockchain_manager.is_connected():
            return
        
        try:
            # Prepare address data for blockchain
            if address_data is None:
                # Fallback to temporary attributes if no data provided
                address_data = {
                    'id': str(self.id),
                    'address_name': self.address_name,
                    'address': getattr(self, '_address', ''),
                    'street': getattr(self, '_street', ''),
                    'suburb': getattr(self, '_suburb', ''),
                    'state': getattr(self, '_state_value', ''),
                    'postcode': getattr(self, '_postcode', ''),
                    'is_default': self.is_default,
                    'is_active': self.is_active
                }
            else:
                # Use provided data and add metadata
                address_data.update({
                    'id': str(self.id),
                    'address_name': self.address_name,
                    'is_default': self.is_default,
                    'is_active': self.is_active
                })
            
            # For now, use a default wallet address (in production, this would be user's wallet)
            user_wallet = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
            
            # Store on blockchain
            result = blockchain_manager.store_address_on_blockchain(address_data, user_wallet)
            
            if result.get('success'):
                # Update blockchain metadata in database
                self.blockchain_tx_hash = result.get('transaction_hash')
                self.blockchain_block_number = result.get('block_number')
                self.is_stored_on_blockchain = True
                
                # Store additional metadata on IPFS
                try:
                    if hasattr(self, 'user_id') and self.user_id:
                        user_obj = User.objects.get(pk=self.user_id)
                        user_id = user_obj.id
                        user_email = user_obj.email
                    elif hasattr(self, 'user') and self.user:
                        if isinstance(self.user, User):
                            user_id = self.user.id
                            user_email = self.user.email
                        elif hasattr(self.user, 'id'):
                            user_id = self.user.id
                            user_email = getattr(self.user, 'email', '')
                        else:
                            user_id = str(self.user)
                            user_email = ''
                    else:
                        user_id = 'unknown'
                        user_email = ''
                    
                    metadata = {
                        'user_id': user_id,
                        'user_email': user_email,
                        'created_at': self.created_at.isoformat(),
                        'updated_at': self.updated_at.isoformat()
                    }
                except Exception as e:
                    print(f"Warning: Could not get user metadata for IPFS: {e}")
                    metadata = {
                        'user_id': 'unknown',
                        'user_email': '',
                        'created_at': self.created_at.isoformat(),
                        'updated_at': self.updated_at.isoformat()
                    }
                
                ipfs_hash = blockchain_manager.store_on_ipfs(metadata)
                if ipfs_hash:
                    self.ipfs_hash = ipfs_hash
                
                # Save blockchain metadata without triggering save again
                Address.objects.filter(pk=self.pk).update(
                    blockchain_tx_hash=self.blockchain_tx_hash,
                    blockchain_block_number=self.blockchain_block_number,
                    is_stored_on_blockchain=self.is_stored_on_blockchain,
                    ipfs_hash=self.ipfs_hash
                )
                
        except Exception as e:
            print(f"Error storing address on blockchain: {e}")
    
    def _has_blockchain_data_changed(self, old_instance):
        """Compares current instance's blockchain data with old instance's blockchain data."""
        if not blockchain_manager.is_connected():
            return False # Cannot check if blockchain is not connected

        current_blockchain_data = self.blockchain_data
        old_blockchain_data = old_instance.blockchain_data

        # If either is None, and the other is not, it's a change
        if (current_blockchain_data is None and old_blockchain_data is not None) or \
           (current_blockchain_data is not None and old_blockchain_data is None):
            return True

        if current_blockchain_data is None and old_blockchain_data is None:
            return False # No data to compare

        fields_to_compare = ['address', 'street', 'suburb', 'state', 'postcode']
        for field in fields_to_compare:
            if current_blockchain_data.get(field) != old_blockchain_data.get(field):
                return True
        return False
    
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
                # Update blockchain metadata to reflect deletion
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
    
    # Address data properties - these fetch from blockchain or database
    @property
    def address_line(self):
        """Get address from blockchain or database."""
        blockchain_data = self.blockchain_data
        if blockchain_data and blockchain_data.get('address'):
            return blockchain_data.get('address', '')
        
        # Get from encrypted database field
        decrypted_data = self._decrypt_address_data()
        return decrypted_data.get('address', '')
    
    @property
    def street_name(self):
        """Get street from blockchain or database."""
        blockchain_data = self.blockchain_data
        if blockchain_data and blockchain_data.get('street'):
            return blockchain_data.get('street', '')
        
        # Get from encrypted database field
        decrypted_data = self._decrypt_address_data()
        return decrypted_data.get('street', '')
    
    @property
    def suburb_name(self):
        """Get suburb from blockchain or database."""
        blockchain_data = self.blockchain_data
        if blockchain_data and blockchain_data.get('suburb'):
            return blockchain_data.get('suburb', '')
        
        # Get from encrypted database field
        decrypted_data = self._decrypt_address_data()
        return decrypted_data.get('suburb', '')
    
    @property
    def state_name(self):
        """Get state from blockchain or database."""
        blockchain_data = self.blockchain_data
        if blockchain_data and blockchain_data.get('state'):
            return blockchain_data.get('state', '')
        
        # Get from encrypted database field
        decrypted_data = self._decrypt_address_data()
        return decrypted_data.get('state', '')
    
    @property
    def postal_code(self):
        """Get postcode from blockchain or database."""
        blockchain_data = self.blockchain_data
        if blockchain_data and blockchain_data.get('postcode'):
            return blockchain_data.get('postcode', '')
        
        # Get from encrypted database field
        decrypted_data = self._decrypt_address_data()
        return decrypted_data.get('postcode', '')
    
    @property
    def full_address(self):
        """Return the complete formatted address from blockchain."""
        return f"{self.address_line}, {self.street_name}, {self.suburb_name}, {self.state_name} {self.postal_code}"
    
    @property
    def address_breakdown(self):
        """Return address breakdown as a dictionary from blockchain."""
        return {
            'address': self.address_line,
            'street': self.street_name,
            'suburb': self.suburb_name,
            'state': self.state_name,
            'postcode': self.postal_code
        }
    
    # Blockchain properties - use database fields for efficiency
    @property
    def blockchain_data(self):
        """Get complete blockchain data for this address."""
        if not self.is_stored_on_blockchain or not blockchain_manager.is_connected():
            return None
        
        try:
            user_wallet = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
            return blockchain_manager.get_address_from_blockchain(str(self.id), user_wallet)
        except:
            return None
    
    @property
    def ipfs_metadata(self):
        """Get IPFS metadata for this address."""
        if not self.ipfs_hash or not blockchain_manager.is_connected():
            return None
        
        try:
            return blockchain_manager.get_from_ipfs(self.ipfs_hash)
        except:
            return None
    
    def _encrypt_address_data(self):
        """Encrypt address data before saving to database."""
        # Only encrypt if we have temporary unencrypted data and it's a string
        if hasattr(self, '_address') and self._address and isinstance(self._address, str):
            setattr(self, 'address', encrypt_address_data({'address': self._address})['address'])
        if hasattr(self, '_street') and self._street and isinstance(self._street, str):
            setattr(self, 'street', encrypt_address_data({'street': self._street})['street'])
        if hasattr(self, '_suburb') and self._suburb and isinstance(self._suburb, str):
            setattr(self, 'suburb', encrypt_address_data({'suburb': self._suburb})['suburb'])
        if hasattr(self, '_state_value') and self._state_value and isinstance(self._state_value, str):
            setattr(self, 'state', encrypt_address_data({'state': self._state_value})['state'])
        if hasattr(self, '_postcode') and self._postcode and isinstance(self._postcode, str):
            setattr(self, 'postcode', encrypt_address_data({'postcode': self._postcode})['postcode'])
    
    def _decrypt_address_data(self):
        """Decrypt address data for reading."""
        # Get the actual field values from the database
        address_value = getattr(self, 'address', '') or ''
        street_value = getattr(self, 'street', '') or ''
        suburb_value = getattr(self, 'suburb', '') or ''
        state_value = getattr(self, 'state', '') or ''
        postcode_value = getattr(self, 'postcode', '') or ''
        
        # Convert to strings if they're not already
        if hasattr(address_value, '__str__'):
            address_value = str(address_value)
        if hasattr(street_value, '__str__'):
            street_value = str(street_value)
        if hasattr(suburb_value, '__str__'):
            suburb_value = str(suburb_value)
        if hasattr(state_value, '__str__'):
            state_value = str(state_value)
        if hasattr(postcode_value, '__str__'):
            postcode_value = str(postcode_value)
        
        decrypted_data = decrypt_address_data({
            'address': address_value,
            'street': street_value,
            'suburb': suburb_value,
            'state': state_value,
            'postcode': postcode_value
        })
        return decrypted_data
    
    # Methods to set address data for creation/updates
    def set_address_data(self, address=None, street=None, suburb=None, state=None, postcode=None):
        """Set address data for blockchain storage."""
        if address is not None:
            self._address = address
        if street is not None:
            self._street = street
        if suburb is not None:
            self._suburb = suburb
        if state is not None:
            self._state_value = state
        if postcode is not None:
            self._postcode = postcode 