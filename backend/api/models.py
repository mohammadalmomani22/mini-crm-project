from django.db import models


class StatusChoice(models.TextChoices):
    ACTIVE = 'active', 'Active'
    INACTIVE = 'inactive', 'Inactive'

class PriorityChoice(models.TextChoices):
    LOW = 'low', 'Low'
    MEDIUM = 'medium', 'Medium'
    HIGH = 'high', 'High'

class Contact(models.Model):
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(max_length=255, null=True, blank=True)
    status = models.CharField(max_length=20, choices=StatusChoice.choices, default=StatusChoice.ACTIVE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.full_name
    
class Task(models.Model):
    contact = models.ForeignKey(Contact, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=255)
    due_date = models.DateField(null=True, blank=True)
    priority = models.CharField(max_length=20, choices=PriorityChoice.choices, default=PriorityChoice.MEDIUM)
    is_done = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title