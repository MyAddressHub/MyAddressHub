// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract AddressHub {
    struct AddressData {
        string addressName;
        string fullAddress;
        string street;
        string suburb;
        string state;
        string postcode;
        bool isDefault;
        bool isActive;
        uint256 createdAt;
        uint256 updatedAt;
    }
    
    // Mapping: user address => address UUID => AddressData
    mapping(address => mapping(bytes32 => AddressData)) public userAddresses;
    
    // Mapping: user address => array of address UUIDs
    mapping(address => bytes32[]) public userAddressIds;
    
    // Events
    event AddressCreated(address indexed user, bytes32 indexed addressId, string addressName);
    event AddressUpdated(address indexed user, bytes32 indexed addressId);
    event AddressDeleted(address indexed user, bytes32 indexed addressId);
    
    modifier onlyAddressOwner(bytes32 addressId) {
        require(userAddresses[msg.sender][addressId].createdAt != 0, "Address does not exist");
        _;
    }
    
    function createAddress(
        bytes32 addressId,
        string memory addressName,
        string memory fullAddress,
        string memory street,
        string memory suburb,
        string memory state,
        string memory postcode,
        bool isDefault
    ) public {
        require(userAddresses[msg.sender][addressId].createdAt == 0, "Address already exists");
        
        // If this is set as default, unset other defaults
        if (isDefault) {
            _unsetOtherDefaults(msg.sender);
        }
        
        userAddresses[msg.sender][addressId] = AddressData({
            addressName: addressName,
            fullAddress: fullAddress,
            street: street,
            suburb: suburb,
            state: state,
            postcode: postcode,
            isDefault: isDefault,
            isActive: true,
            createdAt: block.timestamp,
            updatedAt: block.timestamp
        });
        
        userAddressIds[msg.sender].push(addressId);
        emit AddressCreated(msg.sender, addressId, addressName);
    }
    
    function updateAddress(
        bytes32 addressId,
        string memory addressName,
        string memory fullAddress,
        string memory street,
        string memory suburb,
        string memory state,
        string memory postcode,
        bool isDefault
    ) public onlyAddressOwner(addressId) {
        AddressData storage addr = userAddresses[msg.sender][addressId];
        
        // If this is set as default, unset other defaults
        if (isDefault && !addr.isDefault) {
            _unsetOtherDefaults(msg.sender);
        }
        
        addr.addressName = addressName;
        addr.fullAddress = fullAddress;
        addr.street = street;
        addr.suburb = suburb;
        addr.state = state;
        addr.postcode = postcode;
        addr.isDefault = isDefault;
        addr.updatedAt = block.timestamp;
        
        emit AddressUpdated(msg.sender, addressId);
    }
    
    function deleteAddress(bytes32 addressId) public onlyAddressOwner(addressId) {
        userAddresses[msg.sender][addressId].isActive = false;
        userAddresses[msg.sender][addressId].updatedAt = block.timestamp;
        emit AddressDeleted(msg.sender, addressId);
    }
    
    function getAddress(bytes32 addressId) public view returns (AddressData memory) {
        return userAddresses[msg.sender][addressId];
    }
    
    function getUserAddresses() public view returns (bytes32[] memory) {
        return userAddressIds[msg.sender];
    }
    
    function getAddressCount() public view returns (uint256) {
        return userAddressIds[msg.sender].length;
    }
    
    function _unsetOtherDefaults(address user) internal {
        for (uint256 i = 0; i < userAddressIds[user].length; i++) {
            bytes32 addressId = userAddressIds[user][i];
            if (userAddresses[user][addressId].isDefault) {
                userAddresses[user][addressId].isDefault = false;
            }
        }
    }
}
