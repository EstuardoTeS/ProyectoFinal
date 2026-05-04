from rest_framework import serializers
from .models import Project
from tasks.serializers import TaskSummarySerializer

class ProjectSerializer(serializers.ModelSerializer):
    client_name = serializers.CharField(source='client.name', read_only=True)
    tasks = TaskSummarySerializer(many=True, read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description', 'client', 'client_name',
            'start_date', 'end_date', 'status', 'created_at', 'tasks',
        ]
        read_only_fields = ['created_at']
