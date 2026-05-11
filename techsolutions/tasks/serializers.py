from rest_framework import serializers
from .models import Task, TaskHistory


class TaskHistorySerializer(serializers.ModelSerializer):
    changed_by_username = serializers.CharField(source='changed_by.username', read_only=True)
    task_title = serializers.CharField(source='task.title', read_only=True)
    project_name = serializers.CharField(source='task.project.name', read_only=True)
    client_name = serializers.CharField(source='task.project.client.name', read_only=True)
    assigned_to_username = serializers.CharField(source='task.assigned_to.username', read_only=True)
    action_label = serializers.CharField(source='get_action_display', read_only=True)
    previous_status_label = serializers.SerializerMethodField()
    new_status_label = serializers.SerializerMethodField()

    class Meta:
        model = TaskHistory
        fields = [
            'id', 'action', 'action_label', 'previous_status', 'previous_status_label',
            'new_status', 'new_status_label', 'changed_by', 'changed_by_username',
            'task_title', 'project_name', 'client_name', 'assigned_to_username',
            'note', 'created_at',
        ]
        read_only_fields = fields

    def get_previous_status_label(self, obj):
        return dict(Task.STATUS).get(obj.previous_status, '')

    def get_new_status_label(self, obj):
        return dict(Task.STATUS).get(obj.new_status, '')

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    project_name = serializers.CharField(source='project.name', read_only=True)
    client_name = serializers.CharField(source='project.client.name', read_only=True)
    history = TaskHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description', 'project', 'project_name', 'created_by',
            'created_by_username', 'assigned_to', 'assigned_to_username',
            'client_name', 'priority', 'status', 'progress', 'progress_note', 'due_date',
            'created_at', 'updated_at', 'history',
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
        fields = ['status', 'progress', 'progress_note']

    def validate_progress(self, value):
        if value < 0 or value > 100:
            raise serializers.ValidationError('El avance debe estar entre 0 y 100.')
        return value
