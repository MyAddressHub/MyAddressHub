"""
Views for the accounts app.
"""

from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from django.utils import timezone
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes
from django.conf import settings
from django.template.loader import render_to_string

from apps.accounts.serializers import (
    UserSerializer, 
    CustomTokenObtainPairSerializer,
    ChangePasswordSerializer,
    ResetPasswordEmailSerializer,
    ResetPasswordSerializer,
    UserProfileSerializer,
    ProfileUpdateSerializer,
    OrganizationMembershipSerializer,
    OrganizationUserCreateSerializer,
    OrganizationUserUpdateSerializer,
)
from apps.accounts.models import Organization, OrganizationMembership
from apps.core.mail import send_email

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.AllowAny]


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Custom token obtain pair view that uses our custom serializer.
    """
    serializer_class = CustomTokenObtainPairSerializer


class ChangePasswordView(generics.UpdateAPIView):
    """
    API endpoint for changing password.
    """
    serializer_class = ChangePasswordSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def update(self, request, *args, **kwargs):
        user = self.get_object()
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            # Check old password
            if not user.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Wrong password."]}, status=status.HTTP_400_BAD_REQUEST)
            
            # Set new password
            user.set_password(serializer.data.get("new_password"))
            user.save()
            
            return Response({"detail": "Password updated successfully."}, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ResetPasswordEmailView(APIView):
    """
    API endpoint for requesting a password reset email.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordEmailSerializer(data=request.data)
        
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            
            try:
                user = User.objects.get(email=email)
                
                # Generate token and URL
                token = default_token_generator.make_token(user)
                uid = urlsafe_base64_encode(force_bytes(user.pk))
                reset_url = f"{settings.FRONTEND_URL}/auth/reset-password?uid={uid}&token={token}"
                
                # Prepare email context
                context = {
                    'user': user,
                    'reset_url': reset_url,
                    'project_name': getattr(settings, 'PROJECT_NAME', 'MyAddressHub'),
                }
                
                # Render email templates
                html_message = render_to_string('email/password_reset_email.html', context)
                text_message = render_to_string('email/password_reset_email.txt', context)
                
                # Send email
                send_email(
                    subject="Reset Your Password",
                    message=text_message,
                    html_message=html_message,
                    to_emails=[user.email],
                )
                
                return Response(
                    {"detail": "Password reset email sent."}, 
                    status=status.HTTP_200_OK
                )
            
            except User.DoesNotExist:
                # Don't reveal whether a user account exists
                pass
                
        return Response(
            {"detail": "Password reset email sent if the account exists."}, 
            status=status.HTTP_200_OK
        )


class ResetPasswordView(APIView):
    """
    API endpoint for resetting password with token.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        
        if serializer.is_valid():
            uid = serializer.validated_data["uid"]
            token = serializer.validated_data["token"]
            password = serializer.validated_data["password"]
            
            try:
                user_id = urlsafe_base64_decode(uid).decode()
                user = User.objects.get(pk=user_id)
                
                if default_token_generator.check_token(user, token):
                    user.set_password(password)
                    user.save()
                    return Response({"detail": "Password reset successful."}, status=status.HTTP_200_OK)
                else:
                    return Response({"detail": "Invalid token."}, status=status.HTTP_400_BAD_REQUEST)
                
            except (TypeError, ValueError, OverflowError, User.DoesNotExist):
                return Response({"detail": "Invalid user."}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(generics.RetrieveAPIView):
    """
    API endpoint for retrieving user profile.
    """
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user


class ProfileUpdateView(generics.UpdateAPIView):
    """
    API endpoint for updating user profile.
    """
    serializer_class = ProfileUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_object(self):
        return self.request.user.profile


# Organization User Management Views

class OrganizationUsersListView(generics.ListAPIView):
    """
    API endpoint for listing organization users.
    """
    serializer_class = OrganizationMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get users of the current user's organization."""
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.organization:
            return OrganizationMembership.objects.filter(
                organization=user.profile.organization,
                is_active=True
            ).select_related('user', 'created_by')
        return OrganizationMembership.objects.none()


class OrganizationUserCreateView(generics.CreateAPIView):
    """
    API endpoint for creating users within an organization.
    """
    serializer_class = OrganizationUserCreateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_context(self):
        """Add organization and creator to serializer context."""
        context = super().get_serializer_context()
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.organization:
            context['organization'] = user.profile.organization
            context['created_by'] = user
        return context
    
    def perform_create(self, serializer):
        """Create user with proper permissions check."""
        user = self.request.user
        
        # Check if user has permission to create users
        if not hasattr(user, 'profile') or not user.profile.organization:
            raise permissions.PermissionDenied("You are not a member of any organization.")
        
        # Get user's membership
        try:
            membership = OrganizationMembership.objects.get(
                organization=user.profile.organization,
                user=user,
                is_active=True
            )
        except OrganizationMembership.DoesNotExist:
            raise permissions.PermissionDenied("You are not a member of this organization.")
        
        # Check if user can manage users
        if not membership.can_manage_users:
            raise permissions.PermissionDenied("You don't have permission to create users.")
        
        # Create the user
        serializer.save()


class OrganizationUserUpdateView(generics.UpdateAPIView):
    """
    API endpoint for updating organization users.
    """
    serializer_class = OrganizationUserUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get users that the current user can manage."""
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.organization:
            # Get all users in the same organization
            organization_users = User.objects.filter(
                profile__organization=user.profile.organization,
                profile__user_type='organization'
            )
            return organization_users
        return User.objects.none()
    
    def perform_update(self, serializer):
        """Update user with permission check."""
        target_user = serializer.instance
        current_user = self.request.user
        
        # Check if current user has permission to manage users
        if not hasattr(current_user, 'profile') or not current_user.profile.organization:
            raise permissions.PermissionDenied("You are not a member of any organization.")
        
        # Get current user's membership
        try:
            current_membership = OrganizationMembership.objects.get(
                organization=current_user.profile.organization,
                user=current_user,
                is_active=True
            )
        except OrganizationMembership.DoesNotExist:
            raise permissions.PermissionDenied("You are not a member of this organization.")
        
        # Check if current user can manage users
        if not current_membership.can_manage_users:
            raise permissions.PermissionDenied("You don't have permission to manage users.")
        
        # Prevent users from updating themselves
        if target_user == current_user:
            raise permissions.PermissionDenied("You cannot update your own account through this endpoint.")
        
        # Check if target user is in the same organization
        if not hasattr(target_user, 'profile') or target_user.profile.organization != current_user.profile.organization:
            raise permissions.PermissionDenied("You can only manage users in your organization.")
        
        serializer.save()


class OrganizationUserDeleteView(generics.UpdateAPIView):
    """
    API endpoint for deactivating organization users.
    """
    serializer_class = OrganizationMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get members that the current user can manage."""
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.organization:
            return OrganizationMembership.objects.filter(
                organization=user.profile.organization,
                is_active=True
            )
        return OrganizationMembership.objects.none()
    
    def perform_update(self, serializer):
        """Deactivate user with permission check."""
        membership = serializer.instance
        current_user = self.request.user
        
        # Check if current user has permission to manage users
        if not hasattr(current_user, 'profile') or not current_user.profile.organization:
            raise permissions.PermissionDenied("You are not a member of any organization.")
        
        # Get current user's membership
        try:
            current_membership = OrganizationMembership.objects.get(
                organization=current_user.profile.organization,
                user=current_user,
                is_active=True
            )
        except OrganizationMembership.DoesNotExist:
            raise permissions.PermissionDenied("You are not a member of this organization.")
        
        # Check if current user can manage users
        if not current_membership.can_manage_users:
            raise permissions.PermissionDenied("You don't have permission to manage users.")
        
        # Prevent users from deactivating themselves
        if membership.user == current_user:
            raise permissions.PermissionDenied("You cannot deactivate your own account.")
        
        # Prevent non-owners from deactivating owners
        if membership.role == 'owner' and current_membership.role != 'owner':
            raise permissions.PermissionDenied("Only owners can deactivate other owners.")
        
        serializer.save(is_active=False)


class OrganizationUserRoleUpdateView(generics.UpdateAPIView):
    """
    API endpoint for updating organization user roles.
    """
    serializer_class = OrganizationMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Get members that the current user can manage."""
        user = self.request.user
        if hasattr(user, 'profile') and user.profile.organization:
            return OrganizationMembership.objects.filter(
                organization=user.profile.organization,
                is_active=True
            )
        return OrganizationMembership.objects.none()
    
    def perform_update(self, serializer):
        """Update user role with permission check."""
        membership = serializer.instance
        current_user = self.request.user
        
        # Check if current user has permission to manage users
        if not hasattr(current_user, 'profile') or not current_user.profile.organization:
            raise permissions.PermissionDenied("You are not a member of any organization.")
        
        # Get current user's membership
        try:
            current_membership = OrganizationMembership.objects.get(
                organization=current_user.profile.organization,
                user=current_user,
                is_active=True
            )
        except OrganizationMembership.DoesNotExist:
            raise permissions.PermissionDenied("You are not a member of this organization.")
        
        # Check if current user can manage users
        if not current_membership.can_manage_users:
            raise permissions.PermissionDenied("You don't have permission to manage users.")
        
        # Prevent users from changing their own role
        if membership.user == current_user:
            raise permissions.PermissionDenied("You cannot change your own role.")
        
        # Prevent non-owners from changing owner roles
        if membership.role == 'owner' and current_membership.role != 'owner':
            raise permissions.PermissionDenied("Only owners can change owner roles.")
        
        serializer.save() 