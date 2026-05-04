from django.contrib.auth.hashers import make_password
from django.db import migrations, models


def seed_admin(apps, schema_editor):
    User = apps.get_model('users', 'User')
    User.objects.filter(role='user').update(role='employee')
    admin, created = User.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@techsolutions.com',
            'role': 'admin',
            'is_staff': True,
            'is_superuser': True,
            'is_active': True,
            'is_protected_admin': True,
        },
    )
    admin.password = make_password('Admin12345')
    admin.role = 'admin'
    admin.is_staff = True
    admin.is_superuser = True
    admin.is_active = True
    admin.is_protected_admin = True
    admin.save()


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.AlterField(
            model_name='user',
            name='role',
            field=models.CharField(
                choices=[
                    ('admin', 'Administrador'),
                    ('employee', 'Empleado'),
                    ('client', 'Cliente'),
                ],
                default='employee',
                max_length=10,
            ),
        ),
        migrations.AddField(
            model_name='user',
            name='is_protected_admin',
            field=models.BooleanField(default=False),
        ),
        migrations.RunPython(seed_admin, migrations.RunPython.noop),
    ]
