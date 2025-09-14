"""
Address admin for MyAddressHub.
"""

from django.contrib import admin
from .models import Address


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    """Admin interface for Address model."""
    list_display = [
        'id', 'user', 'address_name', 'is_default', 'is_active', 
        'is_stored_on_blockchain', 'last_synced_at', 'created_at'
    ]
    list_filter = [
        'is_default', 'is_active', 'is_stored_on_blockchain', 'created_at', 'updated_at', 'last_synced_at'
    ]
    search_fields = [
        'user__email', 'user__username', 'address_name'
    ]
    readonly_fields = [
        'id', 'created_at', 'updated_at', 'blockchain_tx_hash', 
        'blockchain_block_number', 'ipfs_hash', 'last_synced_at'
    ]
    list_select_related = ['user']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'user', 'address_name')
        }),
        ('Status', {
            'fields': ('is_default', 'is_active')
        }),
        ('Blockchain Information', {
            'fields': ('is_stored_on_blockchain', 'last_synced_at', 'blockchain_tx_hash', 'blockchain_block_number', 'ipfs_hash'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return super().get_queryset(request).select_related('user') 