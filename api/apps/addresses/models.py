"""
Address models for MyAddressHub.
"""

import uuid
from django.db import models
from django.contrib.auth.models import User
from django.core.validators import RegexValidator


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
        super().save(*args, **kwargs)
    
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