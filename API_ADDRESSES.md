# Address Management API

This document describes the API endpoints for managing user addresses in MyAddressHub.

## Base URL
```
/api/addresses/
```

## Authentication
All endpoints require authentication. Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. Get User Addresses
**GET** `/api/addresses/user/`

Get all addresses for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-string",
      "address_name": "Home",
      "address": "123 Main Street",
      "street": "123 Main Street",
      "suburb": "Downtown",
      "state": "California",
      "postcode": "90210",
      "is_default": true,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z",
      "full_address": "123 Main Street, Downtown, California 90210",
      "address_breakdown": {
        "address": "123 Main Street",
        "street": "123 Main Street",
        "suburb": "Downtown",
        "state": "California",
        "postcode": "90210"
      }
    }
  ],
  "count": 1
}
```

### 2. Create Address
**POST** `/api/addresses/`

Create a new address for the authenticated user.

**Request Body:**
```json
{
  "address_name": "Work",
  "address": "456 Business Ave",
  "street": "456 Business Ave",
  "suburb": "Business District",
  "state": "New York",
  "postcode": "10001",
  "is_default": false
}
```

**Response:**
```json
{
  "id": "uuid-string",
  "address_name": "Work",
  "address": "456 Business Ave",
  "street": "456 Business Ave",
  "suburb": "Business District",
  "state": "New York",
  "postcode": "10001",
  "is_default": false,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "full_address": "456 Business Ave, Business District, New York 10001",
  "address_breakdown": {
    "address": "456 Business Ave",
    "street": "456 Business Ave",
    "suburb": "Business District",
    "state": "New York",
    "postcode": "10001"
  }
}
```

### 3. Get Address by UUID
**GET** `/api/addresses/{address_id}/`

Get a specific address by its UUID.

**Response:**
```json
{
  "id": "uuid-string",
  "address_name": "Home",
  "address": "123 Main Street",
  "street": "123 Main Street",
  "suburb": "Downtown",
  "state": "California",
  "postcode": "90210",
  "is_default": true,
  "is_active": true,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z",
  "full_address": "123 Main Street, Downtown, California 90210",
  "address_breakdown": {
    "address": "123 Main Street",
    "street": "123 Main Street",
    "suburb": "Downtown",
    "state": "California",
    "postcode": "90210"
  }
}
```

### 4. Update Address
**PUT** `/api/addresses/{address_id}/`

Update an existing address.

**Request Body:**
```json
{
  "address_name": "Updated Home",
  "address": "789 New Street",
  "street": "789 New Street",
  "suburb": "New District",
  "state": "California",
  "postcode": "90211",
  "is_default": true
}
```

**Response:** Same as GET address response.

### 5. Delete Address
**DELETE** `/api/addresses/{address_id}/`

Soft delete an address (sets is_active to false).

**Response:**
```json
{
  "success": true,
  "message": "Address deleted successfully"
}
```

### 6. Get Address Breakdown
**GET** `/api/addresses/{address_id}/breakdown/`

Get detailed address breakdown by UUID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "address_name": "Home",
    "address_breakdown": {
      "address": "123 Main Street",
      "street": "123 Main Street",
      "suburb": "Downtown",
      "state": "California",
      "postcode": "90210"
    },
    "full_address": "123 Main Street, Downtown, California 90210",
    "is_default": true,
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
}
```

### 7. Set Default Address
**POST** `/api/addresses/{address_id}/set-default/`

Set an address as the default for the user.

**Response:**
```json
{
  "success": true,
  "message": "Address \"Home\" set as default",
  "data": {
    "id": "uuid-string",
    "address_name": "Home",
    "is_default": true,
    // ... other address fields
  }
}
```

### 8. Get Default Address
**GET** `/api/addresses/default/`

Get the default address for the authenticated user.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "address_name": "Home",
    "is_default": true,
    // ... other address fields
  }
}
```

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "At least one address field (address, street, suburb, state, postcode) must be provided."
}
```

### 401 Unauthorized
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Address not found or access denied"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Data Model

### Address Fields

| Field | Type | Description | Required |
|-------|------|-------------|----------|
| `id` | UUID | Unique identifier | Auto-generated |
| `address_name` | String | Name for the address (e.g., "Home", "Work") | Yes |
| `address` | Text | Full address | Yes |
| `street` | String | Street address | Yes |
| `suburb` | String | Suburb/City | Yes |
| `state` | String | State/Province | Yes |
| `postcode` | String | Postal/ZIP code | Yes |
| `is_default` | Boolean | Whether this is the default address | No |
| `is_active` | Boolean | Whether the address is active | No |
| `created_at` | DateTime | Creation timestamp | Auto-generated |
| `updated_at` | DateTime | Last update timestamp | Auto-generated |

### Validation Rules

- **Postcode**: Can only contain letters, numbers, spaces, and hyphens
- **Address Fields**: At least one of address, street, suburb, state, or postcode must be provided
- **Default Address**: Only one address per user can be set as default
- **User Ownership**: Users can only access their own addresses

## Usage Examples

### JavaScript/TypeScript
```javascript
import { addressesAPI } from '@/shared/api/addresses';

// Get all addresses
const addresses = await addressesAPI.getUserAddresses();

// Create new address
const newAddress = await addressesAPI.createAddress({
  address_name: 'Work',
  address: '123 Business St',
  street: '123 Business St',
  suburb: 'Downtown',
  state: 'California',
  postcode: '90210',
  is_default: false
});

// Get address breakdown
const breakdown = await addressesAPI.getAddressBreakdown('uuid-string');
```

### cURL Examples

```bash
# Get user addresses
curl -H "Authorization: Bearer <token>" \
     https://api.myaddresshub.com/api/addresses/user/

# Create address
curl -X POST \
     -H "Authorization: Bearer <token>" \
     -H "Content-Type: application/json" \
     -d '{"address_name":"Home","address":"123 Main St","street":"123 Main St","suburb":"Downtown","state":"CA","postcode":"90210"}' \
     https://api.myaddresshub.com/api/addresses/

# Get address breakdown
curl -H "Authorization: Bearer <token>" \
     https://api.myaddresshub.com/api/addresses/<uuid>/breakdown/
``` 