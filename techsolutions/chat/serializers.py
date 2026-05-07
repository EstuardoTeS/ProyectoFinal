from rest_framework import serializers

from users.models import User
from .models import Conversation, Message


class ConversationSerializer(serializers.ModelSerializer):
    employee = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.filter(role='employee', is_active=True),
        required=False,
    )
    admin_username = serializers.CharField(source='admin.username', read_only=True)
    employee_username = serializers.CharField(source='employee.username', read_only=True)
    last_message = serializers.SerializerMethodField()
    last_message_at = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id',
            'admin',
            'admin_username',
            'employee',
            'employee_username',
            'subject',
            'last_message',
            'last_message_at',
            'unread_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['admin', 'created_at', 'updated_at']

    def get_last_message(self, obj):
        message = obj.messages.order_by('-created_at').first()
        return message.body if message else ''

    def get_last_message_at(self, obj):
        message = obj.messages.order_by('-created_at').first()
        return message.created_at if message else None

    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        return obj.messages.filter(is_read=False).exclude(sender=request.user).count()


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source='sender.username', read_only=True)
    sender_role = serializers.CharField(source='sender.role', read_only=True)

    class Meta:
        model = Message
        fields = [
            'id',
            'conversation',
            'sender',
            'sender_username',
            'sender_role',
            'body',
            'is_read',
            'created_at',
        ]
        read_only_fields = ['sender', 'is_read', 'created_at']

    def validate_body(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('El mensaje no puede estar vacío.')
        return value
