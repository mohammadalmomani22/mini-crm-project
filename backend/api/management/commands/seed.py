from django.core.management.base import BaseCommand
from api.models import Contact, Task
from datetime import date, timedelta
import random


class Command(BaseCommand):
    help = 'Seed database with sample contacts and tasks'

    def handle(self, *args, **options):
        # Clear existing data
        Task.objects.all().delete()
        Contact.objects.all().delete()

        contacts_data = [
            {"full_name": "Ahmad Al-Zoubi", "phone": "+962791000001", "email": "ahmad@company.com", "status": "active"},
            {"full_name": "Sara Khalil", "phone": "+962792000002", "email": "sara@startup.io", "status": "active"},
            {"full_name": "Omar Hassan", "phone": "+962793000003", "email": "omar@tech.jo", "status": "active"},
            {"full_name": "Lina Mansour", "phone": "+962794000004", "email": "lina@design.com", "status": "inactive"},
            {"full_name": "Khaled Nasser", "phone": "+962795000005", "email": "khaled@corp.jo", "status": "active"},
            {"full_name": "Rania Faris", "phone": "+962796000006", "email": "rania@agency.com", "status": "active"},
            {"full_name": "Yousef Barakat", "phone": "+962797000007", "email": "yousef@dev.io", "status": "inactive"},
            {"full_name": "Dina Sharif", "phone": "+962798000008", "email": "dina@media.jo", "status": "active"},
            {"full_name": "Tariq Awad", "phone": "+962799000009", "email": "tariq@sales.com", "status": "active"},
            {"full_name": "Nour Haddad", "phone": "+962780000010", "email": "nour@market.jo", "status": "active"},
            {"full_name": "Fadi Khatib", "phone": "+962781000011", "email": "fadi@build.com", "status": "inactive"},
            {"full_name": "Hala Jubran", "phone": "+962782000012", "email": "hala@consult.jo", "status": "active"},
            {"full_name": "Zaid Qasem", "phone": "+962783000013", "email": "zaid@finance.com", "status": "active"},
            {"full_name": "Mona Atiyeh", "phone": "+962784000014", "email": "mona@legal.jo", "status": "active"},
            {"full_name": "Basem Taha", "phone": "+962785000015", "email": "basem@hr.com", "status": "inactive"},
        ]

        tasks_titles = [
            "Schedule follow-up call", "Send proposal document", "Review contract terms",
            "Prepare meeting agenda", "Update contact information", "Send invoice",
            "Complete onboarding", "Draft partnership agreement", "Conduct needs assessment",
            "Deliver project update", "Arrange site visit", "Submit quarterly report",
        ]

        priorities = ["low", "medium", "high"]
        contacts = []

        for data in contacts_data:
            contact = Contact.objects.create(**data)
            contacts.append(contact)
            self.stdout.write(f"  Created contact: {contact.full_name}")

        for contact in contacts:
            num_tasks = random.randint(1, 4)
            for _ in range(num_tasks):
                Task.objects.create(
                    contact=contact,
                    title=random.choice(tasks_titles),
                    due_date=date.today() + timedelta(days=random.randint(1, 60)),
                    priority=random.choice(priorities),
                    is_done=random.choice([True, False, False, False]),
                )

        total_tasks = Task.objects.count()
        self.stdout.write(self.style.SUCCESS(
            f'\nSeeded {len(contacts)} contacts and {total_tasks} tasks'
        ))