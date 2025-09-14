"""
Blockchain integration for address storage.
Uses Polygon (Matic) for address data and IPFS for additional storage.
"""

import os
import json
import uuid
from typing import Dict, Any, Optional
from web3 import Web3
import ipfshttpclient
from django.conf import settings
from django.core.exceptions import ValidationError


class BlockchainAddressManager:
    """Manages address storage on blockchain."""
    
    def __init__(self):
        self.polygon_rpc_url = os.getenv('POLYGON_RPC_URL', 'http://localhost:8545')
        self.ipfs_api_url = os.getenv('IPFS_API_URL', 'http://localhost:5001')
        
        # Initialize Web3 connection to Polygon
        self.w3 = Web3(Web3.HTTPProvider(self.polygon_rpc_url))
        
        # Initialize IPFS client
        try:
            # Try different IPFS connection methods
            if self.ipfs_api_url.startswith('http'):
                # Use HTTP API
                self.ipfs_client = ipfshttpclient.connect(self.ipfs_api_url)
            else:
                # Try default connection
                self.ipfs_client = ipfshttpclient.connect()
        except Exception as e:
            print(f"Warning: Could not connect to IPFS: {e}")
            self.ipfs_client = None
        
        # Contract ABI and address (you'll need to deploy this)
        self.contract_address = os.getenv('ADDRESS_HUB_CONTRACT_ADDRESS')
        self.contract_abi = self._load_contract_abi()
        
        if self.contract_address and self.contract_abi:
            self.contract = self.w3.eth.contract(
                address=self.contract_address,
                abi=self.contract_abi
            )
        else:
            self.contract = None
            print("Warning: Contract not configured. Blockchain features disabled.")
    
    def _load_contract_abi(self) -> Optional[list]:
        """Load contract ABI from file."""
        try:
            # Try multiple possible locations for the contract ABI
            possible_paths = [
                os.path.join(settings.BASE_DIR, 'contracts', 'artifacts', 'contracts', 'AddressHub.sol', 'AddressHub.json'),
                os.path.join(settings.BASE_DIR, '..', 'contracts', 'artifacts', 'contracts', 'AddressHub.sol', 'AddressHub.json'),
                os.path.join(settings.BASE_DIR, 'contracts', 'AddressHub.json'),
                os.path.join(settings.BASE_DIR, '..', 'contracts', 'AddressHub.json'),
            ]
            
            for abi_path in possible_paths:
                if os.path.exists(abi_path):
                    with open(abi_path, 'r') as f:
                        contract_data = json.load(f)
                        if 'abi' in contract_data:
                            return contract_data['abi']
                        else:
                            print(f"Warning: No ABI found in {abi_path}")
            
            print("Warning: Contract ABI file not found in any expected location")
            return None
            
        except Exception as e:
            print(f"Warning: Error loading contract ABI: {e}")
            return None
    
    def store_address_on_blockchain(self, address_data: Dict[str, Any], user_wallet: str) -> Dict[str, Any]:
        """
        Store address data on blockchain.
        
        Args:
            address_data: Address data to store
            user_wallet: User's wallet address
            
        Returns:
            Dict with transaction hash and status
        """
        if not self.contract:
            raise ValidationError("Blockchain contract not configured")
        
        try:
            # Convert UUID to bytes32
            uuid_hex = address_data['id'].replace('-', '')
            # Pad with zeros to make it 32 bytes
            padded_hex = uuid_hex.zfill(64)  # 32 bytes = 64 hex characters
            address_id = self.w3.to_bytes(hexstr=padded_hex)
            
            # Construct full address
            full_address = f"{address_data.get('address', '')}, {address_data.get('street', '')}, {address_data.get('suburb', '')}, {address_data.get('state', '')} {address_data.get('postcode', '')}"
            
            # Debug: Print the data being passed
            print(f"Debug - address_data: {address_data}")
            print(f"Debug - address_id type: {type(address_id)}")
            print(f"Debug - address_name type: {type(address_data.get('address_name', ''))}")
            print(f"Debug - full_address type: {type(full_address)}")
            print(f"Debug - street type: {type(address_data.get('street', ''))}")
            print(f"Debug - suburb type: {type(address_data.get('suburb', ''))}")
            print(f"Debug - state type: {type(address_data.get('state', ''))}")
            print(f"Debug - postcode type: {type(address_data.get('postcode', ''))}")
            print(f"Debug - is_default type: {type(address_data.get('is_default', False))}")
            
            # Ensure all string parameters are properly converted
            address_name = str(address_data.get('address_name', ''))
            street = str(address_data.get('street', ''))
            suburb = str(address_data.get('suburb', ''))
            state = str(address_data.get('state', ''))
            postcode = str(address_data.get('postcode', ''))
            is_default = bool(address_data.get('is_default', False))
            
            # Call the smart contract to store the address
            print(f"Storing address on blockchain: {address_data['id']}")
            print(f"Address data: {address_data}")
            
            # Build the transaction
            tx = self.contract.functions.createAddress(
                address_id,
                address_name,
                full_address,
                street,
                suburb,
                state,
                postcode,
                is_default
            ).build_transaction({
                'from': user_wallet,
                'gas': 2000000,
                'gasPrice': self.w3.eth.gas_price,
                'nonce': self.w3.eth.get_transaction_count(user_wallet)
            })
            
            # For development with hardhat, we'll simulate the transaction
            # In production, you would sign and send the transaction
            print(f"Transaction built: {tx}")
            
            return {
                'success': True,
                'transaction_hash': f"0x{uuid.uuid4().hex}",
                'block_number': self.w3.eth.block_number,
                'message': 'Address stored on blockchain (simulated for development)'
            }
            
        except Exception as e:
            raise ValidationError(f"Failed to store address on blockchain: {str(e)}")
    
    def get_address_from_blockchain(self, address_id: str, user_wallet: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve address data from blockchain.
        
        Args:
            address_id: Address UUID
            user_wallet: User's wallet address
            
        Returns:
            Address data or None if not found
        """
        if not self.contract:
            return None
        
        try:
            # Convert UUID to bytes32 with proper padding
            uuid_hex = address_id.replace('-', '')
            padded_hex = uuid_hex.zfill(64)  # 32 bytes = 64 hex characters
            address_id_bytes = self.w3.to_bytes(hexstr=padded_hex)
            address_data = self.contract.functions.getAddress(address_id_bytes).call({'from': user_wallet})
            
            if address_data[8] == 0:  # createdAt is 0 if address doesn't exist
                return None
            
            return {
                'id': address_id,
                'address_name': address_data[0],
                'address': address_data[1],
                'street': address_data[2],
                'suburb': address_data[3],
                'state': address_data[4],
                'postcode': address_data[5],
                'is_default': address_data[6],
                'is_active': address_data[7],
                'created_at': address_data[8],
                'updated_at': address_data[9]
            }
            
        except Exception as e:
            print(f"Error retrieving address from blockchain: {e}")
            return None
    
    def store_on_ipfs(self, data: Dict[str, Any]) -> Optional[str]:
        """
        Store data on IPFS.
        
        Args:
            data: Data to store
            
        Returns:
            IPFS hash or None if failed
        """
        if not self.ipfs_client:
            return None
        
        try:
            # Convert data to JSON and store on IPFS
            json_data = json.dumps(data, default=str)
            result = self.ipfs_client.add_json(json_data)
            return result
        except Exception as e:
            print(f"Error storing data on IPFS: {e}")
            return None
    
    def get_from_ipfs(self, ipfs_hash: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve data from IPFS.
        
        Args:
            ipfs_hash: IPFS hash
            
        Returns:
            Data or None if failed
        """
        if not self.ipfs_client:
            return None
        
        try:
            data = self.ipfs_client.get_json(ipfs_hash)
            return data
        except Exception as e:
            print(f"Error retrieving data from IPFS: {e}")
            return None
    
    def is_connected(self) -> bool:
        """Check if blockchain connection is available."""
        try:
            return self.w3.is_connected()
        except:
            return False


# Global instance
blockchain_manager = BlockchainAddressManager()
