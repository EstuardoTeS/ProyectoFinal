from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('tasks', '0003_update_task_status_choices'),
    ]

    operations = [
        migrations.CreateModel(
            name='TaskHistory',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('action', models.CharField(choices=[('created', 'Creada'), ('status_changed', 'Cambio de estado'), ('updated', 'Actualizada')], max_length=20)),
                ('previous_status', models.CharField(blank=True, choices=[('pending', 'Pendiente'), ('in_progress', 'En progreso'), ('completed', 'Finalizada'), ('cancelled', 'Cancelada')], max_length=20)),
                ('new_status', models.CharField(blank=True, choices=[('pending', 'Pendiente'), ('in_progress', 'En progreso'), ('completed', 'Finalizada'), ('cancelled', 'Cancelada')], max_length=20)),
                ('note', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('changed_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='task_history_entries', to=settings.AUTH_USER_MODEL)),
                ('task', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='history', to='tasks.task')),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
    ]
