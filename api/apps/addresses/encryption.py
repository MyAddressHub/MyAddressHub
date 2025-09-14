"""
Address encryption utilities for secure data storage.
"""

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
    
    def encrypt_dict(self, data_dict: dict) -> dict:
        """
        Encrypt all string values in a dictionary.
        
        Args:
            data_dict: Dictionary with string values to encrypt
            
        Returns:
            Dictionary with encrypted values
        """
        encrypted_dict = {}
        for key, value in data_dict.items():
            if isinstance(value, str) and value:
                encrypted_dict[key] = self.encrypt(value)
            else:
                encrypted_dict[key] = value
        return encrypted_dict
    
    def decrypt_dict(self, encrypted_dict: dict) -> dict:
        """
        Decrypt all encrypted values in a dictionary.
        
        Args:
            encrypted_dict: Dictionary with encrypted values
            
        Returns:
            Dictionary with decrypted values
        """
        decrypted_dict = {}
        for key, value in encrypted_dict.items():
            if isinstance(value, str) and value:
                try:
                    decrypted_dict[key] = self.decrypt(value)
                except ValueError:
                    # If decryption fails, assume it's not encrypted
                    decrypted_dict[key] = value
            else:
                decrypted_dict[key] = value
        return decrypted_dict


# Global encryption instance
address_encryption = AddressEncryption()


def encrypt_address_data(address_data: dict) -> dict:
    """
    Encrypt address data for database storage.
    
    Args:
        address_data: Dictionary containing address fields
        
    Returns:
        Dictionary with encrypted address fields
    """
    # Fields to encrypt
    fields_to_encrypt = ['address', 'street', 'suburb', 'state', 'postcode']
    
    encrypted_data = {}
    for key, value in address_data.items():
        if key in fields_to_encrypt and isinstance(value, str) and value:
            encrypted_data[key] = address_encryption.encrypt(value)
        else:
            encrypted_data[key] = value
    
    return encrypted_data


def decrypt_address_data(encrypted_data: dict) -> dict:
    """
    Decrypt address data from database.
    
    Args:
        encrypted_data: Dictionary containing encrypted address fields
        
    Returns:
        Dictionary with decrypted address fields
    """
    # Fields that might be encrypted
    fields_to_decrypt = ['address', 'street', 'suburb', 'state', 'postcode']
    
    decrypted_data = {}
    for key, value in encrypted_data.items():
        if key in fields_to_decrypt and isinstance(value, str) and value:
            try:
                decrypted_data[key] = address_encryption.decrypt(value)
            except ValueError:
                # If decryption fails, assume it's not encrypted
                decrypted_data[key] = value
        else:
            decrypted_data[key] = value
    
    return decrypted_data
