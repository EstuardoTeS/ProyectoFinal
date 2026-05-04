from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    client_name = serializers.CharField(source='project.client.name', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'project', 'project_name', 'created_by',
            'created_by_username', 'assigned_to', 'assigned_to_username',
            'client_name', 'priority', 'status', 'progress', 'progress_note', 'due_date',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def validate_progress(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError('El avance debe estar entre 0 y 100.')
        return value


class TaskSummarySerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'assigned_to', 'assigned_to_username',
            'status', 'progress', 'progress_note', 'due_date',
        ]


class EmployeeTaskStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['status']
