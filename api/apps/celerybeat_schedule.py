"""
Celery Beat schedule configuration for MyAddressHub.
This file defines periodic tasks that run automatically.
"""

from celery.schedules import crontab

# Define periodic tasks
CELERYBEAT_SCHEDULE = {
    # Batch sync addresses to blockchain every 5 minutes
    'batch-sync-addresses': {
        'task': 'apps.addresses.tasks.schedule_batch_sync',
        'schedule': 300.0,  # 5 minutes (300 seconds)
        'options': {
            'queue': 'celery',
            'routing_key': 'celery'
        }
    },
    
    # Alternative: Run every 2 minutes for more frequent sync
    # 'batch-sync-addresses-frequent': {
    #     'task': 'apps.addresses.batch_sync.schedule_batch_sync',
    #     'schedule': 120.0,  # 2 minutes
    #     'options': {
    #         'queue': 'default',
    #         'routing_key': 'default'
    #     }
    # },
    
    # Run at specific times (e.g., every hour at minute 0)
    # 'batch-sync-hourly': {
    #     'task': 'apps.addresses.batch_sync.schedule_batch_sync',
    #     'schedule': crontab(minute=0),  # Every hour at minute 0
    #     'options': {
    #         'queue': 'default',
    #         'routing_key': 'default'
    #     }
    # },
    
    # Cleanup expired sessions daily at 2 AM
    'cleanup-expired-sessions': {
        'task': 'project.tasks.cleanup_expired_sessions',
        'schedule': crontab(hour=2, minute=0),  # Daily at 2 AM
        'options': {
            'queue': 'celery',
            'routing_key': 'celery'
        }
    },
    
    # Health check task every minute
    'health-check': {
        'task': 'project.tasks.health_check',
        'schedule': 60.0,  # 1 minute
        'options': {
            'queue': 'celery',
            'routing_key': 'celery'
        }
    },
}
