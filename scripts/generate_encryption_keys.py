#!/usr/bin/env python3
"""
Generate encryption keys for address data.
"""

import os
import base64
import secrets
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC


def generate_fernet_key():
    """Generate a new Fernet encryption key."""
    return Fernet.generate_key()


def generate_salt():
    """Generate a random salt for key derivation."""
    return secrets.token_hex(16)


def generate_password():
    """Generate a random password for key derivation."""
    return secrets.token_urlsafe(32)


def derive_key_from_password(password: str, salt: str):
    """Derive a key from password and salt using PBKDF2."""
    salt_bytes = salt.encode()
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt_bytes,
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(password.encode()))
    return key


def main():
    """Generate encryption keys and display them."""
    print("🔐 Generating encryption keys for MyAddressHub...")
    print("=" * 50)
    
    # Generate Fernet key
    fernet_key = generate_fernet_key()
    fernet_key_b64 = base64.urlsafe_b64encode(fernet_key).decode()
    
    # Generate password and salt for PBKDF2
    password = generate_password()
    salt = generate_salt()
    
    # Derive key from password
    derived_key = derive_key_from_password(password, salt)
    derived_key_b64 = base64.urlsafe_b64encode(derived_key).decode()
    
    print("🔑 Encryption Keys Generated:")
    print(f"Fernet Key (Base64): {fernet_key_b64}")
    print(f"Password: {password}")
    print(f"Salt: {salt}")
    print(f"Derived Key (Base64): {derived_key_b64}")
    print()
    
    print("📝 Add these to your .env file:")
    print("=" * 50)
    print(f"ADDRESS_ENCRYPTION_KEY={fernet_key_b64}")
    print(f"ADDRESS_ENCRYPTION_PASSWORD={password}")
    print(f"ADDRESS_ENCRYPTION_SALT={salt}")
    print()
    
    print("⚠️  IMPORTANT SECURITY NOTES:")
    print("=" * 50)
    print("1. Store these keys securely (e.g., in a password manager)")
    print("2. Never commit these keys to version control")
    print("3. Use different keys for different environments")
    print("4. Keep backups of your keys in a secure location")
    print("5. If keys are compromised, regenerate them and re-encrypt all data")
    print()
    
    print("🧪 Testing encryption/decryption:")
    print("=" * 50)
    
    # Test encryption/decryption
    cipher = Fernet(fernet_key)
    test_data = "123 Main Street, Anytown, USA 12345"
    
    encrypted = cipher.encrypt(test_data.encode())
    encrypted_b64 = base64.urlsafe_b64encode(encrypted).decode()
    
    decrypted = cipher.decrypt(base64.urlsafe_b64decode(encrypted_b64.encode()))
    decrypted_text = decrypted.decode()
    
    print(f"Original: {test_data}")
    print(f"Encrypted: {encrypted_b64}")
    print(f"Decrypted: {decrypted_text}")
    print(f"Test passed: {test_data == decrypted_text}")
    
    if test_data == decrypted_text:
        print("✅ Encryption/decryption test successful!")
    else:
        print("❌ Encryption/decryption test failed!")


if __name__ == "__main__":
    main()
