from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('tasks', '0002_task_progress_and_client_owner'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Pendiente'),
                    ('in_progress', 'En progreso'),
                    ('completed', 'Finalizada'),
                    ('cancelled', 'Cancelada'),
                ],
                default='pending',
                max_length=20,
            ),
        ),
    ]
