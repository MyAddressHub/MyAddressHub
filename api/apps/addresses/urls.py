"""
Address URLs for MyAddressHub.
"""

from django.urls import path
from . import views

app_name = 'addresses'

urlpatterns = [
    # Main CRUD endpoints
    path('', views.AddressListView.as_view(), name='address-list'),
    path('<uuid:id>/', views.AddressDetailView.as_view(), name='address-detail'),
    
    # Special endpoints
    path('user/', views.user_addresses, name='user-addresses'),
    path('default/', views.default_address, name='default-address'),
    path('<uuid:address_id>/set-default/', views.set_default_address, name='set-default-address'),
    path('<uuid:address_id>/breakdown/', views.AddressBreakdownView.as_view(), name='address-breakdown'),
    path('test-data/', views.test_address_data, name='test-address-data'),
    
    # Blockchain endpoints
    path('blockchain-status/', views.blockchain_status, name='blockchain-status'),
    
    # Organization features
    path('lookup/<uuid:address_uuid>/', views.lookup_address_by_uuid, name='lookup-address-by-uuid'),
    path('lookup-history/', views.organization_lookup_history, name='organization-lookup-history'),
    
    # Permission management
    path('<uuid:address_id>/grant-permission/', views.grant_address_permission, name='grant-address-permission'),
    path('<uuid:address_id>/revoke-permission/<uuid:organization_id>/', views.revoke_address_permission, name='revoke-address-permission'),
    path('<uuid:address_id>/permissions/', views.get_address_permissions, name='get-address-permissions'),
    path('organizations/', views.list_organizations, name='list-organizations'),
] 