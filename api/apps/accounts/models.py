"""
Models for the accounts app.
"""

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone

from apps.core.models import TimeStampedModel, UUIDModel


class Organization(UUIDModel, TimeStampedModel):
    """
    Organization model for organizational users.
    """
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.name


class Profile(UUIDModel, TimeStampedModel):
    """
    User profile model that extends the built-in User model.
    """
    USER_TYPE_CHOICES = [
        ('individual', 'Individual'),
        ('organization', 'Organization'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='individual')
    organization = models.ForeignKey(Organization, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    bio = models.TextField(max_length=500, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    phone_number = models.CharField(max_length=20, blank=True)
    
    def __str__(self):
        return f"{self.user.username}'s Profile"
    
    @property
    def is_individual(self):
        return self.user_type == 'individual'
    
    @property
    def is_organization_user(self):
        return self.user_type == 'organization'
    
    @property
    def organization_role(self):
        """Get the user's role in their organization."""
        if not self.is_organization_user or not self.organization:
            return None
        
        try:
            membership = OrganizationMembership.objects.get(
                organization=self.organization,
                user=self.user,
                is_active=True
            )
            return membership.role
        except OrganizationMembership.DoesNotExist:
            return None
    
    @property
    def can_manage_organization_users(self):
        """Check if user can manage other users in their organization."""
        role = self.organization_role
        return role in ['owner', 'admin', 'manager']
    
    @classmethod
    def get_or_create_for_user(cls, user):
        """
        Safely get or create a profile for a user.
        """
        profile, created = cls.objects.get_or_create(
            user=user,
            defaults={
                'user_type': 'individual',
            }
        )
        return profile, created


@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    """
    Signal handler to create a profile when a user is created.
    """
    if created:
        Profile.get_or_create_for_user(instance)


@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    """
    Signal handler to save a profile when a user is saved.
    """
    # Only handle existing users, not newly created ones
    if not kwargs.get('created', False):
        try:
            # Check if profile exists before saving
            if hasattr(instance, 'profile'):
                instance.profile.save()
        except User.profile.RelatedObjectDoesNotExist:
            # Create profile if it doesn't exist (using get_or_create to prevent duplicates)
            Profile.get_or_create_for_user(instance)


class LoginAttempt(TimeStampedModel):
    """
    Model to track login attempts for security monitoring.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True)
    username = models.CharField(max_length=150)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    successful = models.BooleanField(default=False)
    
    def __str__(self):
        status = "successful" if self.successful else "failed"
        return f"{status} login attempt by {self.username} from {self.ip_address}"


class AddressPermission(UUIDModel, TimeStampedModel):
    """
    Model to track which organizations can access specific addresses.
    """
    address = models.ForeignKey('addresses.Address', on_delete=models.CASCADE, related_name='permissions')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='address_permissions')
    granted_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='granted_permissions')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['address', 'organization']
    
    def __str__(self):
        return f"{self.organization.name} -> {self.address.address_name}"


class OrganizationMembership(UUIDModel, TimeStampedModel):
    """
    Model to track organization memberships and their roles.
    """
    ROLE_CHOICES = [
        ('owner', 'Owner'),
        ('admin', 'Administrator'),
        ('manager', 'Manager'),
        ('member', 'Member'),
    ]
    
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='memberships')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='organization_memberships')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member')
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_memberships')
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ['organization', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username} - {self.organization.name} ({self.role})"
    
    @property
    def can_manage_users(self):
        """Check if user can manage other users in the organization."""
        return self.role in ['owner', 'admin', 'manager']
    
    @property
    def can_manage_organization(self):
        """Check if user can manage organization settings."""
        return self.role in ['owner', 'admin']


class LookupRecord(UUIDModel, TimeStampedModel):
    """
    Model to track address lookups by organization users.
    """
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='lookup_records')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='lookup_records')
    address = models.ForeignKey('addresses.Address', on_delete=models.CASCADE, related_name='lookup_records')
    lookup_successful = models.BooleanField(default=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        status = "SUCCESS" if self.lookup_successful else "FAILED"
        return f"{self.organization.name} - {self.address.address_name} ({status})" 