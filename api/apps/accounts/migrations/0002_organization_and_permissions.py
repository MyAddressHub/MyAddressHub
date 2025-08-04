# Generated manually for Organization and AddressPermission models

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0001_initial'),
        ('addresses', '0002_alter_address_id_alter_address_user'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Organization',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('name', models.CharField(max_length=255)),
                ('description', models.TextField(blank=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.AddField(
            model_name='profile',
            name='organization',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='users', to='accounts.organization'),
        ),
        migrations.AddField(
            model_name='profile',
            name='user_type',
            field=models.CharField(choices=[('individual', 'Individual'), ('organization', 'Organization')], default='individual', max_length=20),
        ),
        migrations.CreateModel(
            name='AddressPermission',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('is_active', models.BooleanField(default=True)),
                ('address', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='permissions', to='addresses.address')),
                ('granted_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='granted_permissions', to=settings.AUTH_USER_MODEL)),
                ('organization', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='address_permissions', to='accounts.organization')),
            ],
            options={
                'unique_together': {('address', 'organization')},
            },
        ),
    ] 