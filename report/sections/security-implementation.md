# Security Implementation - MyAddressHub

## 7. Security Implementation

### 7.1 Authentication & Authorization

#### 7.1.1 JWT Authentication System

**Token Structure and Configuration**:
```python
# JWT Settings
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'VERIFYING_KEY': None,
    'AUDIENCE': None,
    'ISSUER': None,
    'JWK_URL': None,
    'LEEWAY': 0,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'AUTH_HEADER_NAME': 'HTTP_AUTHORIZATION',
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
    'USER_AUTHENTICATION_RULE': 'rest_framework_simplejwt.authentication.default_user_authentication_rule',
    'AUTH_TOKEN_CLASSES': ('rest_framework_simplejwt.tokens.AccessToken',),
    'TOKEN_TYPE_CLAIM': 'token_type',
    'TOKEN_USER_CLASS': 'rest_framework_simplejwt.models.TokenUser',
    'JTI_CLAIM': 'jti',
    'SLIDING_TOKEN_REFRESH_EXP_CLAIM': 'refresh_exp',
    'SLIDING_TOKEN_LIFETIME': timedelta(minutes=5),
    'SLIDING_TOKEN_REFRESH_LIFETIME': timedelta(days=1),
}
```

**JWT Token Payload Structure**:
```json
{
  "token_type": "access",
  "exp": 1757774271,
  "iat": 1757770671,
  "jti": "86c109393ddf4b71a7a7962fef1d104b",
  "user_id": 2,
  "username": "testuser",
  "email": "test@example.com",
  "first_name": "",
  "last_name": "",
  "is_staff": true,
  "user_type": "individual"
}
```

**Custom Token View Implementation**:
```python
# views.py
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import status
from rest_framework.response import Response

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['user_type'] = user.profile.user_type if hasattr(user, 'profile') else 'individual'
        token['is_staff'] = user.is_staff
        token['email'] = user.email
        
        return token
    
    def validate(self, attrs):
        data = super().validate(attrs)
        
        # Add user data to response
        data['user'] = {
            'id': self.user.id,
            'username': self.user.username,
            'email': self.user.email,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'is_active': self.user.is_active,
            'user_type': self.user.profile.user_type if hasattr(self.user, 'profile') else 'individual'
        }
        
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        
        if response.status_code == 200:
            # Log successful login
            self.log_login_attempt(request, success=True)
        else:
            # Log failed login
            self.log_login_attempt(request, success=False)
        
        return response
    
    def log_login_attempt(self, request, success=True):
        """Log login attempts for security monitoring."""
        try:
            from apps.accounts.models import LoginAttempt
            
            LoginAttempt.objects.create(
                email=request.data.get('email', ''),
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                success=success,
                timestamp=timezone.now()
            )
        except Exception as e:
            # Don't fail the login if logging fails
            print(f"Failed to log login attempt: {e}")
    
    def get_client_ip(self, request):
        """Get client IP address from request."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
```

#### 7.1.2 Permission System

**User Types and Roles**:
```python
# models.py
class Profile(models.Model):
    USER_TYPE_CHOICES = [
        ('individual', 'Individual'),
        ('organization', 'Organization'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    user_type = models.CharField(max_length=20, choices=USER_TYPE_CHOICES, default='individual')
    is_individual = models.BooleanField(default=True)
    is_organization_user = models.BooleanField(default=False)
    
    def __str__(self):
        return f"{self.user.email} - {self.user_type}"
```

**Address Permission Model**:
```python
class AddressPermission(models.Model):
    PERMISSION_CHOICES = [
        ('read', 'Read Only'),
        ('write', 'Read and Write'),
        ('admin', 'Full Access'),
    ]
    
    address = models.ForeignKey(Address, on_delete=models.CASCADE, related_name='permissions')
    organization = models.ForeignKey(Organization, on_delete=models.CASCADE, related_name='address_permissions')
    permission_type = models.CharField(max_length=20, choices=PERMISSION_CHOICES)
    granted_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    granted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    
    class Meta:
        unique_together = ['address', 'organization']
    
    def is_valid(self):
        """Check if permission is still valid."""
        if not self.is_active:
            return False
        if self.expires_at and timezone.now() > self.expires_at:
            return False
        return True
```

**Custom Permission Classes**:
```python
# permissions.py
from rest_framework import permissions

class IsAddressOwnerOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow owners of an address to edit it.
    """
    
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # Write permissions are only allowed to the owner of the address.
        return obj.user == request.user

class IsOrganizationUser(permissions.BasePermission):
    """
    Permission class for organization users.
    """
    
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            hasattr(request.user, 'profile') and
            request.user.profile.is_organization_user
        )

class HasAddressPermission(permissions.BasePermission):
    """
    Permission class for address access based on permissions.
    """
    
    def has_object_permission(self, request, view, obj):
        # Owner always has full access
        if obj.user == request.user:
            return True
        
        # Check organization permissions
        if hasattr(request.user, 'profile') and request.user.profile.is_organization_user:
            # Get user's organization
            user_org = request.user.profile.organization
            
            # Check if organization has permission for this address
            permission = AddressPermission.objects.filter(
                address=obj,
                organization=user_org,
                is_active=True
            ).first()
            
            if permission and permission.is_valid():
                # Check permission level based on request method
                if request.method in permissions.SAFE_METHODS:
                    return True  # Read access
                elif request.method in ['PUT', 'PATCH']:
                    return permission.permission_type in ['write', 'admin']
                elif request.method == 'DELETE':
                    return permission.permission_type == 'admin'
        
        return False
```

### 7.2 Data Encryption

#### 7.2.1 Encryption Implementation

**Fernet Encryption Class**:
```python
# encryption.py
import os
import base64
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

class AddressEncryption:
    """
    Handles encryption and decryption of address data.
    Uses Fernet (symmetric encryption) with PBKDF2 key derivation.
    """
    
    def __init__(self):
        self.key = self._get_encryption_key()
        self.cipher = Fernet(self.key)
    
    def _get_encryption_key(self):
        """Get or generate encryption key."""
        # Try to get key from environment
        key_string = os.getenv('ADDRESS_ENCRYPTION_KEY')
        
        if key_string:
            try:
                # Decode base64 key
                return base64.urlsafe_b64decode(key_string.encode())
            except Exception as e:
                raise ImproperlyConfigured(f"Invalid ADDRESS_ENCRYPTION_KEY: {e}")
        
        # Generate key from password if no key provided
        password = os.getenv('ADDRESS_ENCRYPTION_PASSWORD', 'default-password-change-in-production')
        salt = os.getenv('ADDRESS_ENCRYPTION_SALT', 'default-salt-change-in-production').encode()
        
        kdf = PBKDF2HMAC(
            algorithm=hashes.SHA256(),
            length=32,
            salt=salt,
            iterations=100000,
        )
        key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
        return key
    
    def encrypt(self, data: str) -> str:
        """
        Encrypt address data.
        
        Args:
            data: String data to encrypt
            
        Returns:
            Base64 encoded encrypted data
        """
        if not data:
            return ""
        
        try:
            encrypted_data = self.cipher.encrypt(data.encode())
            return base64.urlsafe_b64encode(encrypted_data).decode()
        except Exception as e:
            raise ValueError(f"Encryption failed: {e}")
    
    def decrypt(self, encrypted_data: str) -> str:
        """
        Decrypt address data.
        
        Args:
            encrypted_data: Base64 encoded encrypted data
            
        Returns:
            Decrypted string data
        """
        if not encrypted_data:
            return ""
        
        try:
            decoded_data = base64.urlsafe_b64decode(encrypted_data.encode())
            decrypted_data = self.cipher.decrypt(decoded_data)
            return decrypted_data.decode()
        except Exception as e:
            raise ValueError(f"Decryption failed: {e}")
```

**Encryption Configuration**:
```python
# settings.py
ENCRYPTION_CONFIG = {
    'algorithm': 'fernet',
    'key_derivation': 'pbkdf2',
    'iterations': 100000,
    'salt_length': 32,
    'key_length': 32,
    'fields_to_encrypt': [
        'address',
        'street', 
        'suburb',
        'state',
        'postcode'
    ]
}

# Environment variables for encryption
ADDRESS_ENCRYPTION_KEY = os.getenv('ADDRESS_ENCRYPTION_KEY')
ADDRESS_ENCRYPTION_PASSWORD = os.getenv('ADDRESS_ENCRYPTION_PASSWORD')
ADDRESS_ENCRYPTION_SALT = os.getenv('ADDRESS_ENCRYPTION_SALT')
```

#### 7.2.2 Model-Level Encryption

**Address Model with Encryption**:
```python
# models.py
class Address(models.Model):
    # ... other fields ...
    
    # Encrypted address fields
    address = models.TextField(blank=True, null=True, help_text="Encrypted address line")
    street = models.TextField(blank=True, null=True, help_text="Encrypted street name")
    suburb = models.TextField(blank=True, null=True, help_text="Encrypted suburb/city")
    state = models.TextField(blank=True, null=True, help_text="Encrypted state/province")
    postcode = models.TextField(blank=True, null=True, help_text="Encrypted postal code")
    
    def _encrypt_address_data(self, address_data: dict) -> dict:
        """Encrypt address data before saving."""
        encrypted_data = {}
        
        for field, value in address_data.items():
            if field in ['address', 'street', 'suburb', 'state', 'postcode']:
                if isinstance(value, str) and value:
                    encrypted_data[field] = address_encryption.encrypt(value)
                else:
                    encrypted_data[field] = value
            else:
                encrypted_data[field] = value
        
        return encrypted_data
    
    def _decrypt_address_data(self) -> dict:
        """Decrypt address data for reading."""
        encrypted_data = {
            'address': self.address,
            'street': self.street,
            'suburb': self.suburb,
            'state': self.state,
            'postcode': self.postcode
        }
        
        return decrypt_address_data(encrypted_data)
    
    @property
    def address_line(self):
        """Decrypted address line."""
        decrypted = self._decrypt_address_data()
        return decrypted.get('address', '')
    
    @property
    def street_name(self):
        """Decrypted street name."""
        decrypted = self._decrypt_address_data()
        return decrypted.get('street', '')
    
    @property
    def suburb_name(self):
        """Decrypted suburb name."""
        decrypted = self._decrypt_address_data()
        return decrypted.get('suburb', '')
    
    @property
    def state_name(self):
        """Decrypted state name."""
        decrypted = self._decrypt_address_data()
        return decrypted.get('state', '')
    
    @property
    def postal_code(self):
        """Decrypted postal code."""
        decrypted = self._decrypt_address_data()
        return decrypted.get('postcode', '')
```

### 7.3 Network Security

#### 7.3.1 HTTPS Configuration

**SSL/TLS Settings**:
```python
# settings.py
# Security settings
SECURE_SSL_REDIRECT = True  # Force HTTPS
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
X_FRAME_OPTIONS = 'DENY'
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

# Additional security headers
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
SECURE_CROSS_ORIGIN_OPENER_POLICY = 'same-origin'
```

**Nginx SSL Configuration**:
```nginx
# nginx.conf
server {
    listen 443 ssl http2;
    server_name myaddresshub.com;
    
    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/myaddresshub.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/myaddresshub.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
    add_header X-Frame-Options DENY always;
    add_header X-Content-Type-Options nosniff always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self'; frame-ancestors 'none';" always;
    
    # API Proxy
    location /api/ {
        proxy_pass http://api_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # Frontend
    location / {
        proxy_pass http://frontend_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name myaddresshub.com;
    return 301 https://$server_name$request_uri;
}
```

#### 7.3.2 CORS Configuration

**CORS Settings**:
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "https://myaddresshub.com",
    "https://www.myaddresshub.com",
    "http://localhost:3000",  # Development only
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_HEADERS = [
    'accept',
    'accept-encoding',
    'authorization',
    'content-type',
    'dnt',
    'origin',
    'user-agent',
    'x-csrftoken',
    'x-requested-with',
    'x-project-key',
    'Access-Control-Allow-Origin'
]

CORS_ALLOW_METHODS = [
    'DELETE',
    'GET',
    'OPTIONS',
    'PATCH',
    'POST',
    'PUT',
]
```

### 7.4 Input Validation & Sanitization

#### 7.4.1 API Validation

**Django Serializer Validation**:
```python
# serializers.py
class AddressCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating addresses with validation."""
    
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
        """Custom validation for address data."""
        address_fields = ['address', 'street', 'suburb', 'state', 'postcode']
        provided_fields = [field for field in address_fields if attrs.get(field)]
        
        if not provided_fields:
            raise serializers.ValidationError(
                "At least one address field (address, street, suburb, state, postcode) must be provided."
            )
        
        # Validate address name uniqueness per user
        user = self.context['request'].user
        address_name = attrs.get('address_name')
        
        if address_name:
            existing = Address.objects.filter(
                user=user,
                address_name=address_name
            )
            if self.instance:
                existing = existing.exclude(pk=self.instance.pk)
            
            if existing.exists():
                raise serializers.ValidationError(
                    "Address name must be unique per user."
                )
        
        return attrs
    
    def validate_postcode(self, value):
        """Validate postal code format."""
        if value:
            # Remove spaces and validate format
            cleaned = value.replace(' ', '')
            if not cleaned.isdigit() or len(cleaned) not in [4, 5, 6]:
                raise serializers.ValidationError(
                    "Postal code must be 4-6 digits."
                )
        return value
    
    def validate_address_name(self, value):
        """Validate address name."""
        if not value or not value.strip():
            raise serializers.ValidationError(
                "Address name is required."
            )
        
        # Sanitize input
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError(
                "Address name must be at least 2 characters long."
            )
        
        return value
```

**Custom Validators**:
```python
# validators.py
import re
from django.core.exceptions import ValidationError

def validate_address_field(value):
    """Validate address field content."""
    if not value:
        return value
    
    # Remove potentially dangerous characters
    dangerous_chars = ['<', '>', '"', "'", '&', '\x00']
    for char in dangerous_chars:
        if char in value:
            raise ValidationError(f"Address field contains invalid character: {char}")
    
    # Check for SQL injection patterns
    sql_patterns = [
        r'union\s+select',
        r'drop\s+table',
        r'delete\s+from',
        r'insert\s+into',
        r'update\s+set',
        r'exec\s*\(',
        r'script\s*>',
    ]
    
    for pattern in sql_patterns:
        if re.search(pattern, value, re.IGNORECASE):
            raise ValidationError("Address field contains potentially malicious content.")
    
    return value

def validate_email_domain(email):
    """Validate email domain against allowed list."""
    allowed_domains = [
        'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
        'company.com', 'organization.org'
    ]
    
    domain = email.split('@')[1].lower()
    if domain not in allowed_domains:
        raise ValidationError(f"Email domain {domain} is not allowed.")
    
    return email
```

#### 7.4.2 SQL Injection Prevention

**Django ORM Usage**:
```python
# views.py
class AddressListView(generics.ListCreateAPIView):
    def get_queryset(self):
        """Use Django ORM to prevent SQL injection."""
        user = self.request.user
        
        # Safe parameterized query
        return Address.objects.filter(
            user=user,
            is_active=True
        ).select_related('user')
    
    def get_queryset_with_search(self, search_term):
        """Safe search with parameterized queries."""
        return Address.objects.filter(
            user=self.request.user,
            address_name__icontains=search_term,  # Django ORM handles escaping
            is_active=True
        )
```

**Raw SQL with Parameterized Queries**:
```python
# Only when absolutely necessary
from django.db import connection

def get_address_stats(user_id):
    """Get address statistics using parameterized raw SQL."""
    with connection.cursor() as cursor:
        cursor.execute(
            "SELECT COUNT(*) FROM addresses WHERE user_id = %s AND is_active = %s",
            [user_id, True]  # Parameters are automatically escaped
        )
        result = cursor.fetchone()
        return result[0]
```

### 7.5 Rate Limiting & DDoS Protection

#### 7.5.1 Django Rate Limiting

**Throttling Configuration**:
```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
        'apps.core.throttling.BlockchainThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'address_create': '10/hour',
        'blockchain_sync': '5/hour',
        'login_attempts': '5/hour',
    }
}
```

**Custom Throttling Classes**:
```python
# throttling.py
from rest_framework.throttling import UserRateThrottle
from django.core.cache import cache

class BlockchainThrottle(UserRateThrottle):
    """Custom throttle for blockchain operations."""
    scope = 'blockchain_sync'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        
        return f'throttle_blockchain_{self.scope}_{ident}'

class LoginAttemptThrottle(UserRateThrottle):
    """Throttle for login attempts."""
    scope = 'login_attempts'
    
    def get_cache_key(self, request, view):
        # Use IP address for anonymous users
        ident = self.get_ident(request)
        return f'throttle_login_{self.scope}_{ident}'
```

#### 7.5.2 Nginx Rate Limiting

**Nginx Rate Limiting Configuration**:
```nginx
# nginx.conf
# Rate limiting zones
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=1r/s;
limit_req_zone $binary_remote_addr zone=blockchain:10m rate=1r/m;

# API rate limiting
location /api/ {
    limit_req zone=api burst=20 nodelay;
    proxy_pass http://api_backend;
}

# Login rate limiting
location /api/auth/login/ {
    limit_req zone=login burst=5 nodelay;
    proxy_pass http://api_backend;
}

# Blockchain operations rate limiting
location /api/addresses/blockchain/ {
    limit_req zone=blockchain burst=2 nodelay;
    proxy_pass http://api_backend;
}
```

### 7.6 Security Monitoring & Logging

#### 7.6.1 Security Event Logging

**Security Logger Configuration**:
```python
# settings.py
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'security': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'json': {
            '()': 'pythonjsonlogger.jsonlogger.JsonFormatter',
            'format': '%(asctime)s %(levelname)s %(name)s %(message)s',
        },
    },
    'handlers': {
        'security_file': {
            'level': 'WARNING',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'logs/security.log',
            'formatter': 'security',
            'maxBytes': 1024 * 1024 * 100,  # 100 MB
            'backupCount': 5,
        },
        'security_console': {
            'level': 'ERROR',
            'class': 'logging.StreamHandler',
            'formatter': 'json',
        },
    },
    'loggers': {
        'security': {
            'handlers': ['security_file', 'security_console'],
            'level': 'WARNING',
            'propagate': True,
        },
    },
}
```

**Security Event Logging**:
```python
# security.py
import logging
from django.utils import timezone

security_logger = logging.getLogger('security')

class SecurityLogger:
    """Centralized security event logging."""
    
    @staticmethod
    def log_login_attempt(email, ip_address, success, user_agent=None):
        """Log login attempts."""
        event = {
            'event_type': 'login_attempt',
            'email': email,
            'ip_address': ip_address,
            'success': success,
            'user_agent': user_agent,
            'timestamp': timezone.now().isoformat(),
        }
        
        if success:
            security_logger.info(f"Successful login: {email} from {ip_address}", extra=event)
        else:
            security_logger.warning(f"Failed login attempt: {email} from {ip_address}", extra=event)
    
    @staticmethod
    def log_permission_denied(user, resource, action, ip_address):
        """Log permission denied events."""
        event = {
            'event_type': 'permission_denied',
            'user_id': user.id if user.is_authenticated else None,
            'user_email': user.email if user.is_authenticated else 'anonymous',
            'resource': resource,
            'action': action,
            'ip_address': ip_address,
            'timestamp': timezone.now().isoformat(),
        }
        
        security_logger.warning(f"Permission denied: {user.email} attempted {action} on {resource}", extra=event)
    
    @staticmethod
    def log_suspicious_activity(user, activity, details, ip_address):
        """Log suspicious activities."""
        event = {
            'event_type': 'suspicious_activity',
            'user_id': user.id if user.is_authenticated else None,
            'user_email': user.email if user.is_authenticated else 'anonymous',
            'activity': activity,
            'details': details,
            'ip_address': ip_address,
            'timestamp': timezone.now().isoformat(),
        }
        
        security_logger.error(f"Suspicious activity: {activity} by {user.email}", extra=event)
    
    @staticmethod
    def log_data_access(user, resource, action, ip_address):
        """Log data access events."""
        event = {
            'event_type': 'data_access',
            'user_id': user.id if user.is_authenticated else None,
            'user_email': user.email if user.is_authenticated else 'anonymous',
            'resource': resource,
            'action': action,
            'ip_address': ip_address,
            'timestamp': timezone.now().isoformat(),
        }
        
        security_logger.info(f"Data access: {user.email} {action} {resource}", extra=event)
```

#### 7.6.2 Brute Force Protection

**Django Axes Configuration**:
```python
# settings.py
AXES_ENABLED = True
AXES_FAILURE_LIMIT = 5
AXES_COOLOFF_TIME = 1  # 1 hour
AXES_LOCKOUT_CALLABLE = 'apps.core.lockout.lockout_handler'
AXES_LOCKOUT_TEMPLATE = 'lockout.html'
AXES_VERBOSE = True
AXES_ENABLE_ADMIN = True

# Custom lockout handler
def lockout_handler(request, credentials, **kwargs):
    """Custom lockout handler."""
    from apps.core.security import SecurityLogger
    
    SecurityLogger.log_suspicious_activity(
        user=request.user,
        activity='brute_force_attempt',
        details=f'IP {request.META.get("REMOTE_ADDR")} locked out after {AXES_FAILURE_LIMIT} failed attempts',
        ip_address=request.META.get('REMOTE_ADDR')
    )
    
    # Send alert email to administrators
    send_security_alert.delay(
        'Brute Force Attack Detected',
        f'IP {request.META.get("REMOTE_ADDR")} has been locked out after multiple failed login attempts.'
    )
```

### 7.7 Data Privacy & Compliance

#### 7.7.1 GDPR Compliance

**Data Anonymization**:
```python
# privacy.py
class DataAnonymizer:
    """Handle data anonymization for GDPR compliance."""
    
    @staticmethod
    def anonymize_user_data(user):
        """Anonymize user data for GDPR compliance."""
        # Anonymize personal data
        user.email = f"anonymized_{user.id}@deleted.com"
        user.first_name = "Anonymized"
        user.last_name = "User"
        user.username = f"anonymized_{user.id}"
        user.save()
        
        # Anonymize address data
        for address in user.addresses.all():
            address.address_name = f"Address {address.id}"
            address.address = "Anonymized"
            address.street = "Anonymized"
            address.suburb = "Anonymized"
            address.state = "Anonymized"
            address.postcode = "00000"
            address.save()
    
    @staticmethod
    def delete_user_data(user):
        """Delete user data for GDPR compliance."""
        # Log the deletion
        SecurityLogger.log_data_access(
            user=user,
            resource='user_data',
            action='delete',
            ip_address='system'
        )
        
        # Delete user and related data
        user.delete()
```

**Data Export for GDPR**:
```python
# views.py
class DataExportView(APIView):
    """Export user data for GDPR compliance."""
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        """Export all user data."""
        user = request.user
        
        # Collect all user data
        data = {
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'date_joined': user.date_joined,
                'last_login': user.last_login,
            },
            'profile': {
                'user_type': user.profile.user_type,
                'created_at': user.profile.created_at,
                'updated_at': user.profile.updated_at,
            },
            'addresses': []
        }
        
        # Add address data (decrypted)
        for address in user.addresses.all():
            address_data = {
                'id': str(address.id),
                'address_name': address.address_name,
                'address': address.address_line,
                'street': address.street_name,
                'suburb': address.suburb_name,
                'state': address.state_name,
                'postcode': address.postal_code,
                'is_default': address.is_default,
                'is_active': address.is_active,
                'created_at': address.created_at,
                'updated_at': address.updated_at,
            }
            data['addresses'].append(address_data)
        
        return Response({
            'success': True,
            'data': data,
            'exported_at': timezone.now().isoformat()
        })
```

#### 7.7.2 Audit Trail

**Audit Log Model**:
```python
# models.py
class AuditLog(models.Model):
    """Audit log for compliance and security."""
    
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('read', 'Read'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('permission_granted', 'Permission Granted'),
        ('permission_revoked', 'Permission Revoked'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    resource_type = models.CharField(max_length=50)
    resource_id = models.CharField(max_length=100, null=True, blank=True)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(null=True, blank=True)
    details = models.JSONField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['resource_type', 'resource_id']),
        ]
    
    def __str__(self):
        return f"{self.user} {self.action} {self.resource_type} at {self.timestamp}"
```

**Audit Logging Middleware**:
```python
# middleware.py
class AuditLoggingMiddleware:
    """Middleware to log all user actions."""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        response = self.get_response(request)
        
        # Log API requests
        if request.path.startswith('/api/') and request.user.is_authenticated:
            self.log_request(request, response)
        
        return response
    
    def log_request(self, request, response):
        """Log API request details."""
        try:
            from apps.core.models import AuditLog
            
            # Determine action from HTTP method
            action_map = {
                'GET': 'read',
                'POST': 'create',
                'PUT': 'update',
                'PATCH': 'update',
                'DELETE': 'delete',
            }
            
            action = action_map.get(request.method, 'unknown')
            
            # Extract resource information
            resource_type = self.get_resource_type(request.path)
            resource_id = self.get_resource_id(request.path)
            
            AuditLog.objects.create(
                user=request.user,
                action=action,
                resource_type=resource_type,
                resource_id=resource_id,
                ip_address=self.get_client_ip(request),
                user_agent=request.META.get('HTTP_USER_AGENT', ''),
                details={
                    'path': request.path,
                    'method': request.method,
                    'status_code': response.status_code,
                }
            )
        except Exception as e:
            # Don't fail the request if logging fails
            print(f"Failed to log audit event: {e}")
    
    def get_resource_type(self, path):
        """Extract resource type from URL path."""
        if '/addresses/' in path:
            return 'address'
        elif '/auth/' in path:
            return 'authentication'
        elif '/users/' in path:
            return 'user'
        else:
            return 'unknown'
    
    def get_resource_id(self, path):
        """Extract resource ID from URL path."""
        import re
        uuid_pattern = r'[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}'
        match = re.search(uuid_pattern, path)
        return match.group(0) if match else None
    
    def get_client_ip(self, request):
        """Get client IP address."""
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
```

---

*This section provides comprehensive security implementation documentation including authentication, encryption, network security, input validation, rate limiting, monitoring, and compliance features.*
