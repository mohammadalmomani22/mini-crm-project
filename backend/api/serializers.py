from rest_framework import serializers
from api.models import Contact, Task
import re
from datetime import date

class ContactSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(min_length=3)
    open_tasks_count = serializers.IntegerField(read_only=True)

    def validate_phone(self, value):

        if value and not re.match(r'^\+?\d+$', value):
            raise serializers.ValidationError("Phone must be numeric with optional leading +")
        return value

    class Meta:
        model = Contact
        fields = ['id', 'full_name', 'phone', 'email', 'status', 'created_at', 'open_tasks_count']

class TaskSerializer(serializers.ModelSerializer):

    title = serializers.CharField(min_length=3)

    def validate_due_date(self, value):
        if value and value < date.today():
            raise serializers.ValidationError("Due date cannot be in the past")
        return value
    
    class Meta:
        model = Task
        fields = ['id', 'contact', 'title', 'due_date', 'priority', 'is_done', 'created_at']