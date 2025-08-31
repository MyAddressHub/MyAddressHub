"""
Address serializers for MyAddressHub.
"""

from rest_framework import serializers
from .models import Address


class AddressBreakdownSerializer(serializers.Serializer):
    """Serializer for address breakdown."""
    address = serializers.CharField(max_length=255)
    street = serializers.CharField(max_length=255)
    suburb = serializers.CharField(max_length=255)
    state = serializers.CharField(max_length=100)
    postcode = serializers.CharField(max_length=10)


class BlockchainInfoSerializer(serializers.Serializer):
    """Serializer for blockchain information."""
    is_stored_on_blockchain = serializers.BooleanField()
    blockchain_tx_hash = serializers.CharField(allow_null=True, allow_blank=True)
    blockchain_block_number = serializers.IntegerField(allow_null=True)
    ipfs_hash = serializers.CharField(allow_null=True, allow_blank=True)


class AddressSerializer(serializers.ModelSerializer):
    """Serializer for Address model."""
    address_breakdown = AddressBreakdownSerializer(source='*', read_only=True)
    full_address = serializers.CharField(read_only=True)
    blockchain_info = BlockchainInfoSerializer(source='*', read_only=True)
    
    class Meta:
        model = Address
        fields = [
            'id', 'address_name', 'address', 'street', 'suburb', 'state', 'postcode',
            'is_default', 'is_active', 'created_at', 'updated_at',
            'address_breakdown', 'full_address', 'blockchain_info',
            'is_stored_on_blockchain', 'blockchain_tx_hash', 'blockchain_block_number', 'ipfs_hash'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'is_stored_on_blockchain', 
                           'blockchain_tx_hash', 'blockchain_block_number', 'ipfs_hash']
    
    def validate(self, attrs):
        """Custom validation for address data."""
        # Ensure at least one field is provided for address breakdown
        address_fields = ['address', 'street', 'suburb', 'state', 'postcode']
        provided_fields = [field for field in address_fields if attrs.get(field)]
        
        if not provided_fields:
            raise serializers.ValidationError(
                "At least one address field (address, street, suburb, state, postcode) must be provided."
            )
        
        return attrs
    
    def create(self, validated_data):
        """Create address and set user."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class AddressCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating addresses."""
    
    class Meta:
        model = Address
        fields = [
            'address_name', 'address', 'street', 'suburb', 'state', 'postcode',
            'is_default', 'is_active'
        ]
    
    def validate(self, attrs):
        """Custom validation for address creation."""
        # Ensure at least one field is provided for address breakdown
        address_fields = ['address', 'street', 'suburb', 'state', 'postcode']
        provided_fields = [field for field in address_fields if attrs.get(field)]
        
        if not provided_fields:
            raise serializers.ValidationError(
                "At least one address field (address, street, suburb, state, postcode) must be provided."
            )
        
        return attrs
    
    def create(self, validated_data):
        """Create address and set user."""
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class AddressUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating addresses."""
    
    class Meta:
        model = Address
        fields = [
            'address_name', 'address', 'street', 'suburb', 'state', 'postcode',
            'is_default', 'is_active'
        ]
    
    def validate(self, attrs):
        """Custom validation for address updates."""
        # Ensure at least one field is provided for address breakdown
        address_fields = ['address', 'street', 'suburb', 'state', 'postcode']
        provided_fields = [field for field in address_fields if attrs.get(field)]
        
        if not provided_fields:
            # Check if any address fields are already set
            instance = self.instance
            existing_fields = [
                instance.address, instance.street, instance.suburb, 
                instance.state, instance.postcode
            ]
            if not any(existing_fields):
                raise serializers.ValidationError(
                    "At least one address field (address, street, suburb, state, postcode) must be provided."
                )
        
        return attrs


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