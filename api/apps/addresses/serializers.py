"""
Address serializers for MyAddressHub.
"""

from rest_framework import serializers
from .models import Address
from .blockchain import blockchain_manager
from .encryption import encrypt_address_data


class AddressBreakdownSerializer(serializers.Serializer):
    """Serializer for address breakdown."""
    address = serializers.CharField(source='address_line', max_length=255)
    street = serializers.CharField(source='street_name', max_length=255)
    suburb = serializers.CharField(source='suburb_name', max_length=255)
    state = serializers.CharField(source='state_name', max_length=100)
    postcode = serializers.CharField(source='postal_code', max_length=10)


class BlockchainInfoSerializer(serializers.Serializer):
    """Serializer for blockchain information."""
    is_stored_on_blockchain = serializers.BooleanField()
    last_synced_at = serializers.DateTimeField(allow_null=True)
    blockchain_tx_hash = serializers.CharField(allow_null=True, allow_blank=True)
    blockchain_block_number = serializers.IntegerField(allow_null=True)
    ipfs_hash = serializers.CharField(allow_null=True, allow_blank=True)
    blockchain_data = serializers.DictField(allow_null=True)
    ipfs_metadata = serializers.DictField(allow_null=True)


class AddressSerializer(serializers.ModelSerializer):
    """Serializer for Address model."""
    address_breakdown = AddressBreakdownSerializer(source='*', read_only=True)
    full_address = serializers.CharField(read_only=True)
    blockchain_info = BlockchainInfoSerializer(source='*', read_only=True)
    
    # Address fields are now read-only properties from blockchain
    address = serializers.CharField(source='address_line', read_only=True)
    street = serializers.CharField(source='street_name', read_only=True)
    suburb = serializers.CharField(source='suburb_name', read_only=True)
    state = serializers.CharField(source='state_name', read_only=True)
    postcode = serializers.CharField(source='postal_code', read_only=True)
    
    class Meta:
        model = Address
        fields = [
            'id', 'address_name', 'address', 'street', 'suburb', 'state', 'postcode',
            'is_default', 'is_active', 'created_at', 'updated_at',
            'address_breakdown', 'full_address', 'blockchain_info',
            'is_stored_on_blockchain', 'last_synced_at', 'blockchain_tx_hash', 'blockchain_block_number', 'ipfs_hash'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'address', 'street', 'suburb', 'state', 'postcode', 
                           'is_stored_on_blockchain', 'last_synced_at', 'blockchain_tx_hash', 'blockchain_block_number', 'ipfs_hash']
    
    def validate(self, attrs):
        """Custom validation for address data."""
        # For updates, we don't validate address fields since they're read-only
        return attrs
    
    def create(self, validated_data):
        """Create address and set user."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class AddressCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating addresses."""
    
    # Address fields for creation
    address = serializers.CharField(max_length=255, required=False, allow_blank=True)
    street = serializers.CharField(max_length=255, required=False, allow_blank=True)
    suburb = serializers.CharField(max_length=255, required=False, allow_blank=True)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    postcode = serializers.CharField(max_length=10, required=False, allow_blank=True)
    
    class Meta:
        model = Address
        fields = [
            'address_name', 'address', 'street', 'suburb', 'state', 'postcode',
            'is_default', 'is_active'
        ]
    
    def validate(self, attrs):
        """Custom validation for address creation."""
        # Ensure at least one address field is provided
        address_fields = ['address', 'street', 'suburb', 'state', 'postcode']
        provided_fields = [field for field in address_fields if attrs.get(field)]
        
        if not provided_fields:
            raise serializers.ValidationError(
                "At least one address field (address, street, suburb, state, postcode) must be provided."
            )
        
        return attrs
    
    def create(self, validated_data):
        """Create address and set user."""
        # Extract address data for blockchain storage
        address_data = {
            'address': validated_data.pop('address', ''),
            'street': validated_data.pop('street', ''),
            'suburb': validated_data.pop('suburb', ''),
            'state': validated_data.pop('state', ''),
            'postcode': validated_data.pop('postcode', '')
        }
        
        # Create the address instance using the standard DRF pattern
        validated_data['user'] = self.context['request'].user
        address = Address.objects.create(**validated_data)
        
        # Now encrypt and update the address data
        if any(address_data.values()):
            # Encrypt the address data
            encrypted_data = encrypt_address_data(address_data)
            
            # Update the address with encrypted data
            Address.objects.filter(pk=address.pk).update(**encrypted_data)
            
            # Refresh the instance to get the updated data
            address.refresh_from_db()
        
        # Store address data on blockchain separately
        if blockchain_manager.is_connected():
            try:
                # Prepare complete address data for blockchain
                blockchain_data = {
                    'id': str(address.id),
                    'address_name': str(address.address_name),
                    'is_default': bool(address.is_default),
                    'is_active': bool(address.is_active),
                    'address': str(address_data.get('address', '')),
                    'street': str(address_data.get('street', '')),
                    'suburb': str(address_data.get('suburb', '')),
                    'state': str(address_data.get('state', '')),
                    'postcode': str(address_data.get('postcode', ''))
                }
                
                # Store on blockchain
                result = blockchain_manager.store_address_on_blockchain(blockchain_data, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
                
                if result.get('success'):
                    # Update blockchain metadata
                    address.blockchain_tx_hash = result.get('transaction_hash')
                    address.blockchain_block_number = result.get('block_number')
                    address.is_stored_on_blockchain = True
                    
                    # Store additional metadata on IPFS
                    metadata = {
                        'user_id': address.user.id,
                        'user_email': address.user.email,
                        'created_at': address.created_at.isoformat(),
                        'updated_at': address.updated_at.isoformat()
                    }
                    
                    ipfs_hash = blockchain_manager.store_on_ipfs(metadata)
                    if ipfs_hash:
                        address.ipfs_hash = ipfs_hash
                    
                    # Save blockchain metadata without triggering save method again
                    Address.objects.filter(pk=address.pk).update(
                        blockchain_tx_hash=address.blockchain_tx_hash,
                        blockchain_block_number=address.blockchain_block_number,
                        is_stored_on_blockchain=address.is_stored_on_blockchain,
                        ipfs_hash=address.ipfs_hash
                    )
                    
            except Exception as e:
                print(f"Warning: Failed to store address on blockchain: {e}")
        
        return address


class AddressUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating addresses."""
    
    # Address fields for updates
    address = serializers.CharField(max_length=255, required=False, allow_blank=True)
    street = serializers.CharField(max_length=255, required=False, allow_blank=True)
    suburb = serializers.CharField(max_length=255, required=False, allow_blank=True)
    state = serializers.CharField(max_length=100, required=False, allow_blank=True)
    postcode = serializers.CharField(max_length=10, required=False, allow_blank=True)
    
    class Meta:
        model = Address
        fields = [
            'address_name', 'address', 'street', 'suburb', 'state', 'postcode',
            'is_default', 'is_active'
        ]
    
    def validate(self, attrs):
        """Custom validation for address updates."""
        # Ensure at least one field is provided (metadata or address data)
        metadata_fields = ['address_name', 'is_default', 'is_active']
        address_fields = ['address', 'street', 'suburb', 'state', 'postcode']
        
        provided_metadata = [field for field in metadata_fields if field in attrs]
        provided_address = [field for field in address_fields if field in attrs]
        
        if not provided_metadata and not provided_address:
            raise serializers.ValidationError(
                "At least one field must be provided for update."
            )
        
        return attrs
    
    def update(self, instance, validated_data):
        """Update address and handle blockchain storage."""
        # Extract address data for blockchain storage
        address_data = {}
        for field in ['address', 'street', 'suburb', 'state', 'postcode']:
            if field in validated_data:
                address_data[field] = validated_data.pop(field)
        
        # Update metadata fields (excluding user to avoid the error)
        for attr, value in validated_data.items():
            if attr != 'user':  # Don't update user field
                setattr(instance, attr, value)
        
        # Set temporary attributes for encryption if address data is provided
        if address_data:
            if 'address' in address_data:
                instance._address = address_data['address']
            if 'street' in address_data:
                instance._street = address_data['street']
            if 'suburb' in address_data:
                instance._suburb = address_data['suburb']
            if 'state' in address_data:
                instance._state_value = address_data['state']
            if 'postcode' in address_data:
                instance._postcode = address_data['postcode']
        
        # Save the instance first (without blockchain storage)
        instance.save()
        
        # Store address data on blockchain separately if provided
        if address_data and blockchain_manager.is_connected():
            try:
                # Prepare complete address data for blockchain
                blockchain_data = {
                    'id': str(instance.id),
                    'address_name': instance.address_name,
                    'is_default': instance.is_default,
                    'is_active': instance.is_active,
                    **address_data
                }
                
                # Store on blockchain
                result = blockchain_manager.store_address_on_blockchain(blockchain_data, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266")
                
                if result.get('success'):
                    # Update blockchain metadata
                    instance.blockchain_tx_hash = result.get('transaction_hash')
                    instance.blockchain_block_number = result.get('block_number')
                    instance.is_stored_on_blockchain = True
                    
                    # Store additional metadata on IPFS
                    metadata = {
                        'user_id': instance.user.id,
                        'user_email': instance.user.email,
                        'created_at': instance.created_at.isoformat(),
                        'updated_at': instance.updated_at.isoformat()
                    }
                    
                    ipfs_hash = blockchain_manager.store_on_ipfs(metadata)
                    if ipfs_hash:
                        instance.ipfs_hash = ipfs_hash
                    
                    # Save blockchain metadata without triggering save method again
                    Address.objects.filter(pk=instance.pk).update(
                        blockchain_tx_hash=instance.blockchain_tx_hash,
                        blockchain_block_number=instance.blockchain_block_number,
                        is_stored_on_blockchain=instance.is_stored_on_blockchain,
                        ipfs_hash=instance.ipfs_hash
                    )
                    
            except Exception as e:
                print(f"Warning: Failed to store address on blockchain: {e}")
        
        return instance


class AddressBreakdownResponseSerializer(serializers.Serializer):
    """Serializer for address breakdown response."""
    id = serializers.UUIDField()
    address_name = serializers.CharField()
    address_breakdown = AddressBreakdownSerializer()
    full_address = serializers.CharField()
    is_default = serializers.BooleanField()
    is_active = serializers.BooleanField()
    created_at = serializers.DateTimeField()
    updated_at = serializers.DateTimeField()


class OrganizationAddressLookupSerializer(serializers.ModelSerializer):
    """
    Minimal serializer for organization address lookups.
    Only shows basic info without revealing full address details.
    """
    address_breakdown = AddressBreakdownSerializer(source='*', read_only=True)
    blockchain_info = BlockchainInfoSerializer(source='*', read_only=True)
    
    class Meta:
        model = Address
        fields = [
            'id', 'address_name', 'is_default', 'is_active', 
            'created_at', 'updated_at', 'address_breakdown', 'blockchain_info'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at'] 