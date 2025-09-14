"""
Migration to encrypt address fields in database.
"""

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('addresses', '0005_add_blockchain_storage_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='address',
            name='address',
            field=models.TextField(blank=True, help_text='Encrypted address line', null=True),
        ),
        migrations.AddField(
            model_name='address',
            name='street',
            field=models.TextField(blank=True, help_text='Encrypted street name', null=True),
        ),
        migrations.AddField(
            model_name='address',
            name='suburb',
            field=models.TextField(blank=True, help_text='Encrypted suburb/city', null=True),
        ),
        migrations.AddField(
            model_name='address',
            name='state',
            field=models.TextField(blank=True, help_text='Encrypted state/province', null=True),
        ),
        migrations.AddField(
            model_name='address',
            name='postcode',
            field=models.TextField(blank=True, help_text='Encrypted postal code', null=True),
        ),
    ]
