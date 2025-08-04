"""
Models for the accounts app.
"""

from django.db import models
from django.contrib.auth.models import User
from django.db.models.signals import post_save
from django.dispatch import receiver

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