"""
Address admin for MyAddressHub.
"""

from django.contrib import admin
from .models import Address


@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    """Admin interface for Address model."""
    list_display = [
        'id', 'user', 'address_name', 'suburb', 'state', 'postcode',
        'is_default', 'is_active', 'created_at'
    ]
    list_filter = [
        'is_default', 'is_active', 'state', 'created_at', 'updated_at'
    ]
    search_fields = [
        'user__email', 'user__username', 'address_name', 'address',
        'street', 'suburb', 'state', 'postcode'
    ]
    readonly_fields = ['id', 'created_at', 'updated_at']
    list_select_related = ['user']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'user', 'address_name')
        }),
        ('Address Details', {
            'fields': ('address', 'street', 'suburb', 'state', 'postcode')
        }),
        ('Status', {
            'fields': ('is_default', 'is_active')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return super().get_queryset(request).select_related('user') 