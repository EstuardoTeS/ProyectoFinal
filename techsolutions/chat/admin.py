from django.contrib import admin

from .models import Conversation, Message


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ('id', 'admin', 'employee', 'subject', 'updated_at')
    search_fields = ('admin__username', 'employee__username', 'subject')
    list_filter = ('created_at', 'updated_at')


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ('id', 'conversation', 'sender', 'is_read', 'created_at')
    search_fields = ('body', 'sender__username')
    list_filter = ('is_read', 'created_at')
