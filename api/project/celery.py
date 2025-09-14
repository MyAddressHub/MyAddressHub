"""
Celery configuration for MyAddressHub
"""

import os

from celery import Celery
from django.conf import settings

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "project.settings.development")

app = Celery("project")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Tasks are now properly defined in apps.addresses.tasks and will be auto-discovered

# Explicitly set the beat schedule since settings loading isn't working
try:
    from apps.celerybeat_schedule import CELERYBEAT_SCHEDULE
    app.conf.beat_schedule = CELERYBEAT_SCHEDULE
    print("✅ Beat schedule loaded:", list(CELERYBEAT_SCHEDULE.keys()))
except ImportError as e:
    print(f"❌ Failed to load beat schedule: {e}")

# Celery Beat schedule and task routes are configured in settings/base.py

@app.task(bind=True, ignore_result=True)
def debug_task(self):
    """Debug task to verify Celery is working."""
    print(f"Request: {self.request!r}") 