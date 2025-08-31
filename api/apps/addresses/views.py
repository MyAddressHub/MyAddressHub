"""
Address views for MyAddressHub.
"""

from rest_framework import status, generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.http import Http404
from django.db.models import Q
from .models import Address
from .serializers import (
    AddressSerializer, 
    AddressCreateSerializer, 
    AddressUpdateSerializer,
    AddressBreakdownSerializer,
    OrganizationAddressLookupSerializer
)
from apps.accounts.models import AddressPermission, Organization, LookupRecord
from .blockchain import blockchain_manager


class AddressListView(generics.ListCreateAPIView):
    """
    List all addresses for the authenticated user and create new addresses.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AddressSerializer
    
    def get_queryset(self):
        """Return addresses based on user type."""
        user = self.request.user
        
        if user.profile.is_individual:
            # Individual users see their own addresses
            return Address.objects.filter(user=user, is_active=True)
        elif user.profile.is_organization_user:
            # Organization users should not see any addresses by default
            # They should only access addresses via UUID lookup
            return Address.objects.none()
        
        return Address.objects.none()
    
    def get_serializer_class(self):
        """Use different serializer for creation."""
        if self.request.method == 'POST':
            return AddressCreateSerializer
        return AddressSerializer
    
    def create(self, request, *args, **kwargs):
        """Override create to return consistent response format."""
        # Only individual users can create addresses
        if not request.user.profile.is_individual:
            return Response({
                'success': False,
                'error': 'Only individual users can create addresses'
            }, status=status.HTTP_403_FORBIDDEN)
        
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            address = serializer.save()
            response_serializer = AddressSerializer(address)
            return Response({
                'success': True,
                'data': response_serializer.data,
                'message': 'Address created successfully'
            }, status=status.HTTP_201_CREATED)
        return Response({
            'success': False,
            'error': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)


class AddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update, or delete an address.
    """
    permission_classes = [permissions.IsAuthenticated]
    serializer_class = AddressSerializer
    lookup_field = 'id'
    
    def get_queryset(self):
        """Return addresses based on user type and permissions."""
        user = self.request.user
        
        if user.profile.is_individual:
            # Individual users can access their own addresses
            return Address.objects.filter(user=user)
        elif user.profile.is_organization_user:
            # Organization users should not access addresses via regular endpoints
            # They should only access addresses via UUID lookup
            return Address.objects.none()
        
        return Address.objects.none()
    
    def get_serializer_class(self):
        """Use different serializer for updates."""
        if self.request.method in ['PUT', 'PATCH']:
            return AddressUpdateSerializer
        return AddressSerializer
    
    def perform_destroy(self, instance):
        """Soft delete the address and remove from blockchain."""
        # Only individual users can delete their own addresses
        if not self.request.user.profile.is_individual or instance.user != self.request.user:
            raise permissions.PermissionDenied("You can only delete your own addresses")
        
        # Use the model's soft_delete method which handles blockchain deletion
        instance.soft_delete()
    
    def update(self, request, *args, **kwargs):
        """Override update to return consistent response format."""
        # Only individual users can update their own addresses
        instance = self.get_object()
        if not request.user.profile.is_individual or instance.user != request.user:
            return Response({
                'success': False,
                'error': 'You can only update your own addresses'
            }, status=status.HTTP_403_FORBIDDEN)
        
        partial = kwargs.pop('partial', False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        if serializer.is_valid():
            address = serializer.save()
            response_serializer = AddressSerializer(address)
            return Response({
                'success': True,
                'data': response_serializer.data,
                'message': 'Address updated successfully'
            })
        return Response({
            'success': False,
            'error': serializer.errors
        }, status=status.HTTP_400_BAD_REQUEST)
    
    def destroy(self, request, *args, **kwargs):
        """Override destroy to return consistent response format."""
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({
            'success': True,
            'message': 'Address deleted successfully'
        }, status=status.HTTP_200_OK)


class AddressBreakdownView(APIView):
    """
    Get address breakdown by UUID.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request, address_id):
        """
        Get address breakdown by UUID.
        
        Args:
            address_id: UUID of the address
            
        Returns:
            Address breakdown with all details
        """
        try:
            user = request.user
            
            if user.profile.is_individual:
                # Individual users can access their own addresses
                address = get_object_or_404(
                    Address, 
                    id=address_id, 
                    user=user,
                    is_active=True
                )
            elif user.profile.is_organization_user and user.profile.organization:
                # Organization users can access addresses they have permission for
                has_permission = AddressPermission.objects.filter(
                    address_id=address_id,
                    organization=user.profile.organization,
                    is_active=True
                ).exists()
                
                if not has_permission:
                    return Response({
                        'success': False,
                        'error': 'Access denied to this address'
                    }, status=status.HTTP_403_FORBIDDEN)
                
                address = get_object_or_404(
                    Address, 
                    id=address_id,
                    is_active=True
                )
            else:
                return Response({
                    'success': False,
                    'error': 'Invalid user type'
                }, status=status.HTTP_403_FORBIDDEN)
            
            serializer = AddressBreakdownSerializer(address)
            return Response({
                'success': True,
                'data': serializer.data
            })
            
        except Http404:
            return Response({
                'success': False,
                'error': 'Address not found or access denied'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({
                'success': False,
                'error': str(e)
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_addresses(request):
    """
    Get all addresses for the authenticated user.
    """
    try:
        user = request.user
        
        if user.profile.is_individual:
            # Individual users see their own addresses
            addresses = Address.objects.filter(
                user=user, 
                is_active=True
            ).order_by('-is_default', '-created_at')
        elif user.profile.is_organization_user:
            # Organization users should not see any addresses by default
            # They should only access addresses via UUID lookup
            addresses = Address.objects.none()
        else:
            addresses = Address.objects.none()
        
        serializer = AddressSerializer(addresses, many=True)
        return Response({
            'success': True,
            'data': serializer.data,
            'count': len(serializer.data)
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def set_default_address(request, address_id):
    """
    Set an address as default for the user.
    """
    try:
        user = request.user
        
        if not user.profile.is_individual:
            return Response({
                'success': False,
                'error': 'Only individual users can set default addresses'
            }, status=status.HTTP_403_FORBIDDEN)
        
        address = get_object_or_404(
            Address, 
            id=address_id, 
            user=user,
            is_active=True
        )
        
        # Set this address as default
        address.is_default = True
        address.save()
        
        serializer = AddressSerializer(address)
        return Response({
            'success': True,
            'message': f'Address "{address.address_name}" set as default',
            'data': serializer.data
        })
        
    except Http404:
        return Response({
            'success': False,
            'error': 'Address not found or access denied'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def default_address(request):
    """
    Get the default address for the authenticated user.
    """
    try:
        user = request.user
        
        if not user.profile.is_individual:
            return Response({
                'success': False,
                'error': 'Only individual users have default addresses'
            }, status=status.HTTP_403_FORBIDDEN)
        
        address = Address.objects.filter(
            user=user,
            is_default=True,
            is_active=True
        ).first()
        
        if not address:
            return Response({
                'success': False,
                'error': 'No default address found'
            }, status=status.HTTP_404_NOT_FOUND)
        
        serializer = OrganizationAddressLookupSerializer(address)
        return Response({
            'success': True,
            'data': serializer.data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def lookup_address_by_uuid(request, address_uuid):
    """
    Look up an address by UUID (organization users only).
    """
    try:
        user = request.user
        
        if not user.profile.is_organization_user:
            return Response({
                'success': False,
                'error': 'Only organization users can look up addresses by UUID'
            }, status=status.HTTP_403_FORBIDDEN)
        
        if not user.profile.organization:
            return Response({
                'success': False,
                'error': 'Organization user must be assigned to an organization'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Check if organization has permission to access this address
        has_permission = AddressPermission.objects.filter(
            address_id=address_uuid,
            organization=user.profile.organization,
            is_active=True
        ).exists()
        
        if not has_permission:
            # Create a failed lookup record
            try:
                address = Address.objects.get(id=address_uuid, is_active=True)
                LookupRecord.objects.create(
                    organization=user.profile.organization,
                    user=user,
                    address=address,
                    lookup_successful=False,
                    ip_address=request.META.get('REMOTE_ADDR'),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    notes='Access denied - no permission'
                )
            except Address.DoesNotExist:
                pass  # Don't create record for non-existent addresses
            
            return Response({
                'success': False,
                'error': 'Access denied to this address'
            }, status=status.HTTP_403_FORBIDDEN)
        
        address = get_object_or_404(
            Address, 
            id=address_uuid,
            is_active=True
        )
        
        # Create a successful lookup record
        LookupRecord.objects.create(
            organization=user.profile.organization,
            user=user,
            address=address,
            lookup_successful=True,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            notes='Successful lookup'
        )
        
        serializer = OrganizationAddressLookupSerializer(address)
        return Response({
            'success': True,
            'data': serializer.data
        })
        
    except Http404:
        return Response({
            'success': False,
            'error': 'Address not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def grant_address_permission(request, address_id):
    """
    Grant permission to an organization to access an address.
    """
    try:
        user = request.user
        
        if not user.profile.is_individual:
            return Response({
                'success': False,
                'error': 'Only individual users can grant permissions'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get the address (must belong to the user)
        address = get_object_or_404(
            Address, 
            id=address_id, 
            user=user,
            is_active=True
        )
        
        organization_id = request.data.get('organization_id')
        if not organization_id:
            return Response({
                'success': False,
                'error': 'organization_id is required'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Get the organization
        organization = get_object_or_404(Organization, id=organization_id, is_active=True)
        
        # Create or update permission
        permission, created = AddressPermission.objects.get_or_create(
            address=address,
            organization=organization,
            defaults={'granted_by': user}
        )
        
        if not created:
            permission.is_active = True
            permission.save()
        
        return Response({
            'success': True,
            'message': f'Permission granted to {organization.name} for address "{address.address_name}"'
        })
        
    except Http404:
        return Response({
            'success': False,
            'error': 'Address or organization not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def revoke_address_permission(request, address_id, organization_id):
    """
    Revoke permission from an organization to access an address.
    """
    try:
        user = request.user
        
        if not user.profile.is_individual:
            return Response({
                'success': False,
                'error': 'Only individual users can revoke permissions'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get the address (must belong to the user)
        address = get_object_or_404(
            Address, 
            id=address_id, 
            user=user,
            is_active=True
        )
        
        # Get the organization
        organization = get_object_or_404(Organization, id=organization_id, is_active=True)
        
        # Get the permission
        permission = get_object_or_404(
            AddressPermission,
            address=address,
            organization=organization
        )
        
        # Soft delete the permission
        permission.is_active = False
        permission.save()
        
        return Response({
            'success': True,
            'message': f'Permission revoked from {organization.name} for address "{address.address_name}"'
        })
        
    except Http404:
        return Response({
            'success': False,
            'error': 'Address, organization, or permission not found'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_address_permissions(request, address_id):
    """
    Get current permissions for an address.
    """
    try:
        user = request.user
        
        if not user.profile.is_individual:
            return Response({
                'success': False,
                'error': 'Only individual users can view address permissions'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get the address (must belong to the user)
        address = get_object_or_404(
            Address, 
            id=address_id, 
            user=user,
            is_active=True
        )
        
        # Get active permissions for this address
        permissions = AddressPermission.objects.filter(
            address=address,
            is_active=True
        ).select_related('organization', 'granted_by')
        
        data = [{
            'id': str(permission.id),
            'organization': {
                'id': str(permission.organization.id),
                'name': permission.organization.name,
                'description': permission.organization.description
            },
            'organizationId': str(permission.organization.id),
            'addressName': address.address_name,
            'grantedByUsername': permission.granted_by.username,
            'isActive': permission.is_active,
            'createdAt': permission.created_at.isoformat()
        } for permission in permissions]
        
        return Response({
            'success': True,
            'data': data
        })
        
    except Http404:
        return Response({
            'success': False,
            'error': 'Address not found or access denied'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def list_organizations(request):
    """
    List all active organizations (for individual users to grant permissions).
    """
    try:
        user = request.user
        
        if not user.profile.is_individual:
            return Response({
                'success': False,
                'error': 'Only individual users can list organizations'
            }, status=status.HTTP_403_FORBIDDEN)
        
        organizations = Organization.objects.filter(is_active=True).order_by('name')
        
        data = [{
            'id': str(org.id),
            'name': org.name,
            'description': org.description
        } for org in organizations]
        
        return Response({
            'success': True,
            'data': data
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def test_address_data(request):
    """
    Test endpoint to see what address data looks like.
    """
    try:
        user = request.user
        
        if user.profile.is_individual:
            addresses = Address.objects.filter(
                user=user, 
                is_active=True
            ).order_by('-is_default', '-created_at')
        elif user.profile.is_organization_user and user.profile.organization:
            permissions = AddressPermission.objects.filter(
                organization=user.profile.organization,
                is_active=True
            ).values_list('address_id', flat=True)
            addresses = Address.objects.filter(
                id__in=permissions,
                is_active=True
            ).order_by('-created_at')
        else:
            addresses = Address.objects.none()
        
        if addresses.exists():
            address = addresses.first()
            return Response({
                'success': True,
                'test_data': {
                    'id': str(address.id),
                    'address_name': address.address_name,
                    'is_default': address.is_default,
                    'created_at': address.created_at.isoformat(),
                    'updated_at': address.updated_at.isoformat(),
                    'full_address': address.full_address,
                    'address': address.address,
                    'street': address.street,
                    'suburb': address.suburb,
                    'state': address.state,
                    'postcode': address.postcode,
                    'blockchain_info': {
                        'is_stored_on_blockchain': address.is_stored_on_blockchain,
                        'blockchain_tx_hash': address.blockchain_tx_hash,
                        'blockchain_block_number': address.blockchain_block_number,
                        'ipfs_hash': address.ipfs_hash,
                        'blockchain_data': address.blockchain_data,
                        'ipfs_metadata': address.ipfs_metadata
                    }
                }
            })
        else:
            return Response({
                'success': True,
                'test_data': 'No addresses found'
            })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def organization_lookup_history(request):
    """
    Get lookup history for the organization user.
    """
    try:
        user = request.user
        if not user.profile.is_organization_user:
            return Response({
                'success': False,
                'error': 'Only organization users can view lookup history'
            }, status=status.HTTP_403_FORBIDDEN)
        if not user.profile.organization:
            return Response({
                'success': False,
                'error': 'Organization user must be assigned to an organization'
            }, status=status.HTTP_403_FORBIDDEN)
        # Get lookup records for this organization
        lookups = LookupRecord.objects.filter(
            organization=user.profile.organization
        ).select_related('address', 'user').order_by('-created_at')
        # Serialize the data
        lookup_data = []
        for lookup in lookups:
            lookup_data.append({
                'address_id': str(lookup.address.id) if lookup.address else None,
                'lookup_date': lookup.created_at.isoformat(),
                'reason': lookup.notes
            })
        return Response({
            'success': True,
            'data': lookup_data,
            'count': len(lookup_data)
        })
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_address_from_blockchain(request, address_id):
    """
    Retrieve address data directly from the blockchain.
    """
    try:
        user = request.user
        
        if not user.profile.is_individual:
            return Response({
                'success': False,
                'error': 'Only individual users can retrieve addresses from blockchain'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get the address from database first
        address = get_object_or_404(
            Address, 
            id=address_id, 
            user=user,
            is_active=True
        )
        
        return Response({
            'success': True,
            'data': {
                'address_id': str(address.id),
                'blockchain_data': address.blockchain_data,
                'ipfs_metadata': address.ipfs_metadata,
                'blockchain_status': {
                    'blockchain_available': blockchain_manager.is_connected(),
                    'contract_address': blockchain_manager.contract_address,
                    'retrieved_from_blockchain': address.is_stored_on_blockchain
                }
            }
        })
        
    except Http404:
        return Response({
            'success': False,
            'error': 'Address not found or access denied'
        }, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_addresses_from_blockchain(request):
    """
    Retrieve all user's addresses from the blockchain.
    """
    try:
        user = request.user
        
        if not user.profile.is_individual:
            return Response({
                'success': False,
                'error': 'Only individual users can retrieve addresses from blockchain'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get user's addresses from database
        db_addresses = Address.objects.filter(user=user, is_active=True)
        
        blockchain_addresses = []
        for address in db_addresses:
            blockchain_addresses.append({
                'address_id': str(address.id),
                'blockchain_data': address.blockchain_data,
                'database_data': {
                    'address_name': address.address_name,
                    'is_default': address.is_default,
                    'is_active': address.is_active,
                    'created_at': address.created_at.isoformat(),
                    'updated_at': address.updated_at.isoformat(),
                    'blockchain_tx_hash': address.blockchain_tx_hash,
                    'blockchain_block_number': address.blockchain_block_number,
                    'ipfs_hash': address.ipfs_hash
                },
                'ipfs_metadata': address.ipfs_metadata
            })
        
        return Response({
            'success': True,
            'data': blockchain_addresses,
            'blockchain_status': {
                'blockchain_available': blockchain_manager.is_connected(),
                'contract_address': blockchain_manager.contract_address,
                'total_addresses': len(db_addresses),
                'addresses_on_blockchain': sum(1 for addr in db_addresses if addr.is_stored_on_blockchain)
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def blockchain_status(request):
    """
    Get blockchain connection status and statistics.
    """
    try:
        user = request.user
        
        if not user.profile.is_individual:
            return Response({
                'success': False,
                'error': 'Only individual users can view blockchain status'
            }, status=status.HTTP_403_FORBIDDEN)
        
        # Get user's addresses
        addresses = Address.objects.filter(user=user, is_active=True)
        
        # Calculate blockchain statistics
        total_addresses = addresses.count()
        addresses_on_blockchain = sum(1 for addr in addresses if addr.is_stored_on_blockchain)
        
        blockchain_status = {
            'blockchain_available': blockchain_manager.is_connected(),
            'total_addresses': total_addresses,
            'addresses_on_blockchain': addresses_on_blockchain,
            'blockchain_percentage': round((addresses_on_blockchain / total_addresses * 100) if total_addresses > 0 else 0, 2),
            'contract_address': blockchain_manager.contract_address if blockchain_manager.contract else None,
            'polygon_rpc_url': blockchain_manager.polygon_rpc_url,
            'ipfs_available': blockchain_manager.ipfs_client is not None
        }
        
        return Response({
            'success': True,
            'data': blockchain_status
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR) 