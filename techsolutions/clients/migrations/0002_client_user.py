import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


def create_client_profiles(apps, schema_editor):
    User = apps.get_model('users', 'User')
    Client = apps.get_model('clients', 'Client')
    for user in User.objects.filter(role='client'):
        client, _ = Client.objects.get_or_create(
            email=user.email,
            defaults={
                'user': user,
                'name': user.username,
                'phone': user.phone,
                'company': '',
                'status': 'active',
            },
        )
        if client.user_id is None:
            client.user = user
            client.save(update_fields=['user'])


class Migration(migrations.Migration):

    dependencies = [
        ('clients', '0001_initial'),
        ('users', '0003_reset_protected_admin_password'),
    ]

    operations = [
        migrations.AddField(
            model_name='client',
            name='user',
            field=models.OneToOneField(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='client_profile',
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.RunPython(create_client_profiles, migrations.RunPython.noop),
    ]
