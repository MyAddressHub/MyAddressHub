"""
Admin configuration for the accounts app.
"""

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User

from apps.accounts.models import Profile, LoginAttempt, Organization, AddressPermission, LookupRecord


class OrganizationAdmin(admin.ModelAdmin):
    """
    Admin for the Organization model.
    """
    list_display = ('name', 'is_active', 'created_at', 'updated_at')
    list_filter = ('is_active', 'created_at')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')


class ProfileInline(admin.StackedInline):
    """
    Inline admin for the Profile model.
    """
    model = Profile
    can_delete = False
    verbose_name_plural = 'Profile'
    fk_name = 'user'
    fields = ('user_type', 'organization', 'bio', 'avatar', 'phone_number')
    
    def get_formset(self, request, obj=None, **kwargs):
        formset = super().get_formset(request, obj, **kwargs)
        form = formset.form
        
        # Add custom logic for organization users
        if obj and hasattr(obj, 'profile'):
            if obj.profile.user_type == 'organization':
                form.base_fields['organization'].required = True
            else:
                form.base_fields['organization'].required = False
        
        return formset


class UserAdmin(BaseUserAdmin):
    """
    Custom user admin that includes the Profile inline.
    """
    inlines = (ProfileInline, )
    list_display = ('username', 'email', 'first_name', 'last_name', 'user_type', 'organization', 'is_staff', 'is_active')
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'profile__user_type', 'profile__organization')
    search_fields = ('username', 'email', 'first_name', 'last_name', 'profile__organization__name')
    
    def user_type(self, obj):
        return obj.profile.user_type if hasattr(obj, 'profile') else 'N/A'
    user_type.short_description = 'User Type'
    
    def organization(self, obj):
        return obj.profile.organization.name if hasattr(obj, 'profile') and obj.profile.organization else 'N/A'
    organization.short_description = 'Organization'


class LoginAttemptAdmin(admin.ModelAdmin):
    """
    Admin for the LoginAttempt model.
    """
    list_display = ('username', 'ip_address', 'successful', 'created_at')
    list_filter = ('successful', 'created_at')
    search_fields = ('username', 'ip_address', 'user_agent')
    readonly_fields = ('username', 'ip_address', 'user_agent', 'successful', 'created_at', 'updated_at')
    date_hierarchy = 'created_at'


class AddressPermissionAdmin(admin.ModelAdmin):
    """
    Admin for the AddressPermission model.
    """
    list_display = ('address', 'organization', 'granted_by', 'is_active', 'created_at')
    list_filter = ('is_active', 'created_at', 'organization')
    search_fields = ('address__address_name', 'organization__name', 'granted_by__username')
    readonly_fields = ('created_at', 'updated_at')


class LookupRecordAdmin(admin.ModelAdmin):
    """
    Admin for the LookupRecord model.
    """
    list_display = ('organization', 'address', 'user', 'lookup_successful', 'created_at')
    list_filter = ('lookup_successful', 'created_at', 'organization')
    search_fields = ('organization__name', 'address__address_name', 'user__username', 'notes')
    readonly_fields = ('created_at', 'updated_at', 'ip_address', 'user_agent')
    date_hierarchy = 'created_at'


# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)
admin.site.register(LoginAttempt, LoginAttemptAdmin)
admin.site.register(Organization, OrganizationAdmin)
admin.site.register(AddressPermission, AddressPermissionAdmin)
admin.site.register(LookupRecord, LookupRecordAdmin) 