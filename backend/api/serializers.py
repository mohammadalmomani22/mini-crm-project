from rest_framework import serializers
from api.models import Contact, Task
import re
from datetime import date
from rest_framework.validators import UniqueTogetherValidator


class ContactSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(min_length=3)
    open_tasks_count = serializers.IntegerField(read_only=True)

    def validate_email(self, value):
        if value:
            qs = Contact.objects.filter(email=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("A contact with this email already exists.")
        return value

    def validate_phone(self, value):
        if value:
            import re
            if not re.match(r'^\+?\d+$', value):
                raise serializers.ValidationError("Phone must contain only digits with optional leading +")
            qs = Contact.objects.filter(phone=value)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError("A contact with this phone already exists.")
        return value

    class Meta:
        model = Contact
        fields = ['id', 'full_name', 'phone', 'email', 'status', 'created_at', 'open_tasks_count']

class TaskSerializer(serializers.ModelSerializer):

    title = serializers.CharField(min_length=3)

    def validate(self, data):
        title = data.get('title', getattr(self.instance, 'title', None))
        contact = data.get('contact', getattr(self.instance, 'contact', None))
        if title and contact:
            qs = Task.objects.filter(contact=contact, title=title)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"title": "This contact already has a task with this title."})
        return data

    def validate_due_date(self, value):
        if value and value < date.today():
            raise serializers.ValidationError("Due date cannot be in the past")
        return value
    
    class Meta:
        model = Task
        fields = ['id', 'contact', 'title', 'due_date', 'priority', 'is_done', 'created_at']