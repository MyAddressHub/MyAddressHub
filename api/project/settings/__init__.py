"""
Settings module for MyAddressHub.
"""

import os

# Default to development settings
environment = os.environ.get("DJANGO_ENV", "development")

if environment == "production":
    from .production import *
elif environment == "staging":
    from .staging import *
elif environment == "simple_dev":
    from .simple_dev import *
else:
    from .development import * 