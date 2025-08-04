# Generated manually for Address model

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('accounts', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Address',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ('address_name', models.CharField(help_text='A name for this address (e.g., \'Home\', \'Work\')', max_length=255)),
                ('address', models.TextField(help_text='Full address')),
                ('street', models.CharField(help_text='Street address', max_length=255)),
                ('suburb', models.CharField(help_text='Suburb/City', max_length=255)),
                ('state', models.CharField(help_text='State/Province', max_length=100)),
                ('postcode', models.CharField(help_text='Postal/ZIP code', max_length=10, validators=[django.core.validators.RegexValidator(message='Postcode can only contain letters, numbers, spaces, and hyphens.', regex='^[0-9A-Za-z\\s\\-]+$')])),
                ('is_default', models.BooleanField(default=False, help_text='Mark as default address')),
                ('is_active', models.BooleanField(default=True, help_text='Address is active')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='addresses', to='auth.User')),
            ],
            options={
                'verbose_name': 'Address',
                'verbose_name_plural': 'Addresses',
                'db_table': 'addresses',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddConstraint(
            model_name='address',
            constraint=models.UniqueConstraint(condition=models.Q(is_default=True), fields=('user', 'is_default'), name='unique_default_address_per_user'),
        ),
    ] 