"""
Serializers for the accounts app.
"""

from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers
from rest_framework.validators import UniqueValidator
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

from apps.accounts.models import Profile, Organization, AddressPermission, OrganizationMembership

User = get_user_model()


class OrganizationSerializer(serializers.ModelSerializer):
    """
    Serializer for the Organization model.
    """
    class Meta:
        model = Organization
        fields = ['id', 'name', 'description', 'is_active', 'created_at', 'updated_at']


class ProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for the Profile model.
    """
    organization = OrganizationSerializer(read_only=True)
    organization_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)
    organization_role = serializers.ReadOnlyField()
    can_manage_organization_users = serializers.ReadOnlyField()
    
    class Meta:
        model = Profile
        fields = [
            'id', 'user_type', 'organization', 'organization_id', 'organization_role', 
            'can_manage_organization_users', 'bio', 'avatar', 'phone_number', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        user_type = attrs.get('user_type', 'individual')
        organization_id = attrs.get('organization_id')
        
        if user_type == 'organization' and not organization_id:
            raise serializers.ValidationError("Organization is required for organization users.")
        
        if user_type == 'individual' and organization_id:
            raise serializers.ValidationError("Individual users cannot be assigned to organizations.")
        
        return attrs
    
    def create(self, validated_data):
        organization_id = validated_data.pop('organization_id', None)
        if organization_id:
            validated_data['organization_id'] = organization_id
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        organization_id = validated_data.pop('organization_id', None)
        if organization_id is not None:
            validated_data['organization_id'] = organization_id
        return super().update(instance, validated_data)


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer for User model, used for registration.
    """
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    user_type = serializers.CharField(write_only=True, required=False, default='individual')
    organization_id = serializers.UUIDField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'password', 'password2', 'user_type', 'organization_id')
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        user_type = attrs.get('user_type', 'individual')
        organization_id = attrs.get('organization_id')
        
        if user_type == 'organization' and not organization_id:
            raise serializers.ValidationError("Organization is required for organization users.")
        
        if user_type == 'individual' and organization_id:
            raise serializers.ValidationError("Individual users cannot be assigned to organizations.")
        
        return attrs

    def create(self, validated_data):
        user_type = validated_data.pop('user_type', 'individual')
        organization_id = validated_data.pop('organization_id', None)
        
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])
        user.save()
        
        # Update profile with user type and organization
        profile = user.profile
        profile.user_type = user_type
        if organization_id:
            profile.organization_id = organization_id
        profile.save()
        
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom token serializer to include additional user info in the token.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        # Add custom claims
        token['username'] = user.username
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        token['is_staff'] = user.is_staff
        
        # Add profile information
        if hasattr(user, 'profile'):
            token['user_type'] = user.profile.user_type
            if user.profile.organization:
                token['organization_id'] = str(user.profile.organization.id)
                token['organization_name'] = user.profile.organization.name

        return token


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for password change endpoint.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True, validators=[validate_password])
    new_password2 = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['new_password'] != attrs.pop('new_password2'):
            raise serializers.ValidationError({"new_password": "Password fields didn't match."})
        return attrs


class ResetPasswordEmailSerializer(serializers.Serializer):
    """
    Serializer for requesting a password reset email.
    """
    email = serializers.EmailField(required=True)


class ResetPasswordSerializer(serializers.Serializer):
    """
    Serializer for resetting password with token.
    """
    uid = serializers.CharField(required=True)
    token = serializers.CharField(required=True)
    password = serializers.CharField(required=True, validators=[validate_password])
    password2 = serializers.CharField(required=True)

    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs


class UserProfileSerializer(serializers.ModelSerializer):
    """
    Serializer for User model with profile data.
    """
    profile = ProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'date_joined', 'last_login', 'profile')
        read_only_fields = ('id', 'date_joined', 'last_login') 


class ProfileUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating user profile data.
    """
    class Meta:
        model = Profile
        fields = ['bio', 'avatar', 'phone_number']


class OrganizationMembershipSerializer(serializers.ModelSerializer):
    """
    Serializer for OrganizationMembership model.
    """
    user_username = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_first_name = serializers.CharField(source='user.first_name', read_only=True)
    user_last_name = serializers.CharField(source='user.last_name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    organization_name = serializers.CharField(source='organization.name', read_only=True)
    
    class Meta:
        model = OrganizationMembership
        fields = [
            'id', 'organization', 'organization_name', 'user', 'user_username', 
            'user_email', 'user_first_name', 'user_last_name', 'role', 
            'created_by', 'created_by_username', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_by', 'created_at', 'updated_at']


class OrganizationUserCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating users within an organization.
    """
    password = serializers.CharField(write_only=True, required=True)
    password2 = serializers.CharField(write_only=True, required=True)
    role = serializers.ChoiceField(choices=OrganizationMembership.ROLE_CHOICES, default='member')
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'password', 'password2', 'role']
        extra_kwargs = {
            'email': {'required': True},
            'first_name': {'required': True},
            'last_name': {'required': True}
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs.pop('password2'):
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs
    
    def create(self, validated_data):
        role = validated_data.pop('role', 'member')
        organization = self.context.get('organization')
        created_by = self.context.get('created_by')
        
        # Create user
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name']
        )
        user.set_password(validated_data['password'])
        user.save()
        
        # Update profile to organization type
        profile = user.profile
        profile.user_type = 'organization'
        profile.organization = organization
        profile.save()
        
        # Create organization membership
        OrganizationMembership.objects.create(
            organization=organization,
            user=user,
            role=role,
            created_by=created_by,
            is_active=True
        )
        
        return user


class OrganizationUserUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer for updating organization users.
    """
    role = serializers.CharField(source='organization_memberships.first.role', read_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'first_name', 'last_name', 'role']
    
    def update(self, instance, validated_data):
        # Update user fields
        instance.username = validated_data.get('username', instance.username)
        instance.email = validated_data.get('email', instance.email)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.save()
        
        return instance


class AddressPermissionSerializer(serializers.ModelSerializer):
    """
    Serializer for AddressPermission model.
    """
    organization = OrganizationSerializer(read_only=True)
    organization_id = serializers.UUIDField(write_only=True)
    address_name = serializers.CharField(source='address.address_name', read_only=True)
    granted_by_username = serializers.CharField(source='granted_by.username', read_only=True)
    
    class Meta:
        model = AddressPermission
        fields = ['id', 'organization', 'organization_id', 'address_name', 'granted_by_username', 'is_active', 'created_at']
        read_only_fields = ['id', 'granted_by_username', 'created_at'] 