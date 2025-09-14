# API Architecture - MyAddressHub

## 5. API Architecture

### 5.1 RESTful API Design Principles

The MyAddressHub API follows REST (Representational State Transfer) principles with the following design patterns:

- **Resource-Based URLs**: Each endpoint represents a resource
- **HTTP Methods**: Proper use of GET, POST, PUT, DELETE, PATCH
- **Status Codes**: Meaningful HTTP status codes for responses
- **JSON Format**: Consistent JSON request/response format
- **Authentication**: JWT-based authentication for all protected endpoints
- **Versioning**: API versioning through URL paths
- **Documentation**: Auto-generated OpenAPI/Swagger documentation

### 5.2 API Base Configuration

```python
# API Configuration
API_CONFIG = {
    'base_url': 'http://localhost:8000/api/',
    'version': 'v1',
    'content_type': 'application/json',
    'authentication': 'JWT Bearer Token',
    'rate_limiting': '100 requests per minute per user',
    'cors_origins': [
        'http://localhost:3000',
        'https://myaddresshub.com'
    ]
}
```

### 5.3 Authentication Endpoints

#### 5.3.1 User Registration

**Endpoint**: `POST /api/auth/register/`

**Request Body**:
```json
{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "securepassword123",
    "password_confirm": "securepassword123",
    "first_name": "John",
    "last_name": "Doe",
    "user_type": "individual"
}
```

**Response** (201 Created):
```json
{
    "success": true,
    "data": {
        "user": {
            "id": 1,
            "username": "johndoe",
            "email": "john@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "is_active": true,
            "date_joined": "2025-09-13T10:30:00Z"
        },
        "tokens": {
            "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
    },
    "message": "User registered successfully"
}
```

#### 5.3.2 User Login

**Endpoint**: `POST /api/auth/login/`

**Request Body**:
```json
{
    "email": "john@example.com",
    "password": "securepassword123"
}
```

**Response** (200 OK):
```json
{
    "success": true,
    "data": {
        "user": {
            "id": 1,
            "username": "johndoe",
            "email": "john@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "is_active": true,
            "user_type": "individual"
        },
        "tokens": {
            "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        }
    },
    "message": "Login successful"
}
```

#### 5.3.3 Token Refresh

**Endpoint**: `POST /api/auth/token/refresh/`

**Request Body**:
```json
{
    "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response** (200 OK):
```json
{
    "success": true,
    "data": {
        "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "message": "Token refreshed successfully"
}
```

### 5.4 Address Management Endpoints

#### 5.4.1 List User Addresses

**Endpoint**: `GET /api/addresses/`

**Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Query Parameters**:
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)
- `search`: Search in address names
- `is_default`: Filter by default status
- `is_active`: Filter by active status
- `is_stored_on_blockchain`: Filter by blockchain status

**Response** (200 OK):
```json
{
    "success": true,
    "data": [
        {
            "id": "f10a94cf-2432-4a31-a31e-6eda9d7ab345",
            "address_name": "Home",
            "address": "123 Main Street",
            "street": "Main Street",
            "suburb": "Downtown",
            "state": "NSW",
            "postcode": "2000",
            "is_default": true,
            "is_active": true,
            "is_stored_on_blockchain": true,
            "last_synced_at": "2025-09-13T15:04:31.639350Z",
            "blockchain_tx_hash": "0x2b490ab4c4f14994996ef522934b6a11",
            "blockchain_block_number": 12345,
            "ipfs_hash": "QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx",
            "created_at": "2025-09-13T13:30:50.520253Z",
            "updated_at": "2025-09-13T15:04:31.639350Z",
            "address_breakdown": {
                "address": "123 Main Street",
                "street": "Main Street",
                "suburb": "Downtown",
                "state": "NSW",
                "postcode": "2000"
            },
            "full_address": "123 Main Street, Main Street, Downtown, NSW 2000",
            "blockchain_info": {
                "is_stored_on_blockchain": true,
                "last_synced_at": "2025-09-13T15:04:31.639350Z",
                "blockchain_tx_hash": "0x2b490ab4c4f14994996ef522934b6a11",
                "blockchain_block_number": 12345,
                "ipfs_hash": "QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx",
                "blockchain_data": null,
                "ipfs_metadata": null
            }
        }
    ],
    "pagination": {
        "page": 1,
        "limit": 20,
        "total": 1,
        "pages": 1,
        "has_next": false,
        "has_previous": false
    },
    "count": 1
}
```

#### 5.4.2 Create New Address

**Endpoint**: `POST /api/addresses/`

**Request Body**:
```json
{
    "address_name": "Work Office",
    "address": "456 Business Ave",
    "street": "Business Ave",
    "suburb": "Business District",
    "state": "VIC",
    "postcode": "3000",
    "is_default": false,
    "is_active": true
}
```

**Response** (201 Created):
```json
{
    "success": true,
    "data": {
        "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "address_name": "Work Office",
        "address": "456 Business Ave",
        "street": "Business Ave",
        "suburb": "Business District",
        "state": "VIC",
        "postcode": "3000",
        "is_default": false,
        "is_active": true,
        "is_stored_on_blockchain": false,
        "last_synced_at": null,
        "blockchain_tx_hash": null,
        "blockchain_block_number": null,
        "ipfs_hash": null,
        "created_at": "2025-09-13T16:00:00.000000Z",
        "updated_at": "2025-09-13T16:00:00.000000Z",
        "address_breakdown": {
            "address": "456 Business Ave",
            "street": "Business Ave",
            "suburb": "Business District",
            "state": "VIC",
            "postcode": "3000"
        },
        "full_address": "456 Business Ave, Business Ave, Business District, VIC 3000",
        "blockchain_info": {
            "is_stored_on_blockchain": false,
            "last_synced_at": null,
            "blockchain_tx_hash": null,
            "blockchain_block_number": null,
            "ipfs_hash": null,
            "blockchain_data": null,
            "ipfs_metadata": null
        }
    },
    "message": "Address created successfully"
}
```

#### 5.4.3 Get Address Details

**Endpoint**: `GET /api/addresses/{id}/`

**Response** (200 OK):
```json
{
    "success": true,
    "data": {
        "id": "f10a94cf-2432-4a31-a31e-6eda9d7ab345",
        "address_name": "Home",
        "address": "123 Main Street",
        "street": "Main Street",
        "suburb": "Downtown",
        "state": "NSW",
        "postcode": "2000",
        "is_default": true,
        "is_active": true,
        "is_stored_on_blockchain": true,
        "last_synced_at": "2025-09-13T15:04:31.639350Z",
        "blockchain_tx_hash": "0x2b490ab4c4f14994996ef522934b6a11",
        "blockchain_block_number": 12345,
        "ipfs_hash": "QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx",
        "created_at": "2025-09-13T13:30:50.520253Z",
        "updated_at": "2025-09-13T15:04:31.639350Z",
        "address_breakdown": {
            "address": "123 Main Street",
            "street": "Main Street",
            "suburb": "Downtown",
            "state": "NSW",
            "postcode": "2000"
        },
        "full_address": "123 Main Street, Main Street, Downtown, NSW 2000",
        "blockchain_info": {
            "is_stored_on_blockchain": true,
            "last_synced_at": "2025-09-13T15:04:31.639350Z",
            "blockchain_tx_hash": "0x2b490ab4c4f14994996ef522934b6a11",
            "blockchain_block_number": 12345,
            "ipfs_hash": "QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx",
            "blockchain_data": null,
            "ipfs_metadata": null
        }
    }
}
```

#### 5.4.4 Update Address

**Endpoint**: `PUT /api/addresses/{id}/`

**Request Body**:
```json
{
    "address_name": "Updated Home Address",
    "address": "789 New Street",
    "street": "New Street",
    "suburb": "New Suburb",
    "state": "QLD",
    "postcode": "4000",
    "is_default": true,
    "is_active": true
}
```

**Response** (200 OK):
```json
{
    "success": true,
    "data": {
        "id": "f10a94cf-2432-4a31-a31e-6eda9d7ab345",
        "address_name": "Updated Home Address",
        "address": "789 New Street",
        "street": "New Street",
        "suburb": "New Suburb",
        "state": "QLD",
        "postcode": "4000",
        "is_default": true,
        "is_active": true,
        "is_stored_on_blockchain": false,
        "last_synced_at": null,
        "blockchain_tx_hash": null,
        "blockchain_block_number": null,
        "ipfs_hash": null,
        "created_at": "2025-09-13T13:30:50.520253Z",
        "updated_at": "2025-09-13T16:30:00.000000Z",
        "address_breakdown": {
            "address": "789 New Street",
            "street": "New Street",
            "suburb": "New Suburb",
            "state": "QLD",
            "postcode": "4000"
        },
        "full_address": "789 New Street, New Street, New Suburb, QLD 4000",
        "blockchain_info": {
            "is_stored_on_blockchain": false,
            "last_synced_at": null,
            "blockchain_tx_hash": null,
            "blockchain_block_number": null,
            "ipfs_hash": null,
            "blockchain_data": null,
            "ipfs_metadata": null
        }
    },
    "message": "Address updated successfully"
}
```

#### 5.4.5 Delete Address

**Endpoint**: `DELETE /api/addresses/{id}/`

**Response** (204 No Content):
```json
{
    "success": true,
    "message": "Address deleted successfully"
}
```

### 5.5 Blockchain Integration Endpoints

#### 5.5.1 Get Blockchain Status

**Endpoint**: `GET /api/addresses/blockchain-status/`

**Response** (200 OK):
```json
{
    "success": true,
    "data": {
        "is_connected": true,
        "network": "hardhat",
        "chain_id": 31337,
        "block_number": 12345,
        "contract_address": "0x5FbDB2315678afecb367f032d93F642f64180aa3",
        "gas_price": "1875000000",
        "pending_transactions": 0,
        "sync_status": "synced"
    }
}
```

#### 5.5.2 Get Addresses from Blockchain

**Endpoint**: `GET /api/addresses/blockchain/addresses/`

**Response** (200 OK):
```json
{
    "success": true,
    "data": [
        {
            "address_id": "f10a94cf-2432-4a31-a31e-6eda9d7ab345",
            "address_name": "Home",
            "full_address": "123 Main Street, Main Street, Downtown, NSW 2000",
            "street": "Main Street",
            "suburb": "Downtown",
            "state": "NSW",
            "postcode": "2000",
            "is_default": true,
            "is_active": true,
            "created_at": 1694608250,
            "updated_at": 1694608250
        }
    ],
    "count": 1
}
```

#### 5.5.3 Get Specific Address from Blockchain

**Endpoint**: `GET /api/addresses/blockchain/address/{id}/`

**Response** (200 OK):
```json
{
    "success": true,
    "data": {
        "address_id": "f10a94cf-2432-4a31-a31e-6eda9d7ab345",
        "address_name": "Home",
        "full_address": "123 Main Street, Main Street, Downtown, NSW 2000",
        "street": "Main Street",
        "suburb": "Downtown",
        "state": "NSW",
        "postcode": "2000",
        "is_default": true,
        "is_active": true,
        "created_at": 1694608250,
        "updated_at": 1694608250
    }
}
```

### 5.6 Organization Features

#### 5.6.1 Address Lookup by UUID

**Endpoint**: `GET /api/addresses/lookup/{uuid}/`

**Response** (200 OK):
```json
{
    "success": true,
    "data": {
        "id": "f10a94cf-2432-4a31-a31e-6eda9d7ab345",
        "address_name": "Home",
        "address": "123 Main Street",
        "street": "Main Street",
        "suburb": "Downtown",
        "state": "NSW",
        "postcode": "2000",
        "is_default": true,
        "is_active": true,
        "created_at": "2025-09-13T13:30:50.520253Z",
        "updated_at": "2025-09-13T15:04:31.639350Z",
        "permissions": {
            "can_read": true,
            "can_write": false,
            "can_admin": false
        }
    }
}
```

#### 5.6.2 Grant Address Permission

**Endpoint**: `POST /api/addresses/{id}/grant-permission/`

**Request Body**:
```json
{
    "organization_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "permission_type": "read",
    "expires_at": "2025-12-31T23:59:59Z"
}
```

**Response** (201 Created):
```json
{
    "success": true,
    "data": {
        "id": "b2c3d4e5-f6g7-8901-bcde-f23456789012",
        "address_id": "f10a94cf-2432-4a31-a31e-6eda9d7ab345",
        "organization_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "permission_type": "read",
        "granted_at": "2025-09-13T16:00:00.000000Z",
        "expires_at": "2025-12-31T23:59:59.000000Z",
        "is_active": true
    },
    "message": "Permission granted successfully"
}
```

### 5.7 Error Handling

#### 5.7.1 Error Response Format

**Standard Error Response**:
```json
{
    "success": false,
    "error": "Error type",
    "message": "Human-readable error message",
    "details": {
        "field_name": ["Specific field error message"],
        "non_field_errors": ["General error message"]
    },
    "code": "ERROR_CODE",
    "timestamp": "2025-09-13T16:00:00.000000Z"
}
```

#### 5.7.2 Common Error Codes

| HTTP Status | Error Code | Description |
|-------------|------------|-------------|
| 400 | `VALIDATION_ERROR` | Request validation failed |
| 401 | `AUTHENTICATION_REQUIRED` | Authentication required |
| 403 | `PERMISSION_DENIED` | Insufficient permissions |
| 404 | `NOT_FOUND` | Resource not found |
| 409 | `CONFLICT` | Resource conflict |
| 429 | `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| 500 | `INTERNAL_SERVER_ERROR` | Internal server error |

#### 5.7.3 Validation Error Example

**Request**:
```json
{
    "address_name": "",
    "address": "",
    "street": "",
    "suburb": "",
    "state": "",
    "postcode": ""
}
```

**Response** (400 Bad Request):
```json
{
    "success": false,
    "error": "Validation failed",
    "message": "The request data is invalid",
    "details": {
        "address_name": ["This field is required."],
        "non_field_errors": ["At least one address field (address, street, suburb, state, postcode) must be provided."]
    },
    "code": "VALIDATION_ERROR",
    "timestamp": "2025-09-13T16:00:00.000000Z"
}
```

### 5.8 API Documentation

#### 5.8.1 Swagger/OpenAPI Integration

**Swagger UI**: Available at `/api/docs/`
**OpenAPI Schema**: Available at `/api/schema/`

**Configuration**:
```python
# settings.py
SPECTACULAR_SETTINGS = {
    'TITLE': 'MyAddressHub API',
    'DESCRIPTION': 'Blockchain-integrated address management system',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
    'COMPONENT_SPLIT_REQUEST': True,
    'SCHEMA_PATH_PREFIX': '/api/',
}
```

#### 5.8.2 API Versioning

**Current Version**: v1 (implicit)
**Future Versions**: v2, v3 (explicit versioning)

**Versioning Strategy**:
- URL-based versioning: `/api/v1/addresses/`
- Header-based versioning: `Accept: application/vnd.myaddresshub.v1+json`
- Query parameter versioning: `/api/addresses/?version=1`

### 5.9 Rate Limiting and Throttling

#### 5.9.1 Rate Limiting Configuration

```python
# settings.py
REST_FRAMEWORK = {
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle'
    ],
    'DEFAULT_THROTTLE_RATES': {
        'anon': '100/hour',
        'user': '1000/hour',
        'address_create': '10/hour',
        'blockchain_sync': '5/hour'
    }
}
```

#### 5.9.2 Custom Throttling

```python
# Custom throttling for blockchain operations
class BlockchainThrottle(UserRateThrottle):
    scope = 'blockchain_sync'
    
    def get_cache_key(self, request, view):
        if request.user and request.user.is_authenticated:
            ident = request.user.pk
        else:
            ident = self.get_ident(request)
        
        return f'throttle_blockchain_{self.scope}_{ident}'
```

### 5.10 API Testing

#### 5.10.1 Unit Testing

```python
# tests/test_api.py
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken

class AddressAPITest(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        self.token = RefreshToken.for_user(self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.token.access_token}')
    
    def test_create_address(self):
        data = {
            'address_name': 'Test Address',
            'address': '123 Test Street',
            'street': 'Test Street',
            'suburb': 'Test City',
            'state': 'Test State',
            'postcode': '12345'
        }
        
        response = self.client.post('/api/addresses/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Address.objects.count(), 1)
    
    def test_list_addresses(self):
        Address.objects.create(
            user=self.user,
            address_name='Test Address',
            address='123 Test Street'
        )
        
        response = self.client.get('/api/addresses/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['data']), 1)
```

#### 5.10.2 Integration Testing

```python
# tests/test_integration.py
class BlockchainIntegrationTest(APITestCase):
    def test_address_blockchain_sync(self):
        # Create address
        address_data = {
            'address_name': 'Blockchain Test',
            'address': '456 Blockchain St',
            'street': 'Blockchain St',
            'suburb': 'Crypto City',
            'state': 'BC',
            'postcode': '12345'
        }
        
        response = self.client.post('/api/addresses/', address_data)
        address_id = response.data['data']['id']
        
        # Trigger blockchain sync
        sync_response = self.client.post(f'/api/addresses/{address_id}/sync-to-blockchain/')
        self.assertEqual(sync_response.status_code, status.HTTP_200_OK)
        
        # Verify blockchain status
        status_response = self.client.get('/api/addresses/blockchain-status/')
        self.assertTrue(status_response.data['data']['is_connected'])
```

---

*This section provides comprehensive API architecture documentation including endpoint specifications, request/response formats, error handling, and testing strategies.*
