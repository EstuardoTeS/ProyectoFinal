from django.db import migrations
from django.contrib.auth.hashers import make_password


def reset_admin_password(apps, schema_editor):
    User = apps.get_model('users', 'User')
    admin = User.objects.filter(username='admin').first()
    if not admin:
        admin = User(username='admin', email='admin@techsolutions.com')
    admin.password = make_password('Admin12345')
    admin.role = 'admin'
    admin.is_staff = True
    admin.is_superuser = True
    admin.is_active = True
    admin.is_protected_admin = True
    admin.save()


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_roles_and_admin_seed'),
    ]

    operations = [
        migrations.RunPython(reset_admin_password, migrations.RunPython.noop),
    ]
