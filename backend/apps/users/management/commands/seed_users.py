from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Create test users for different roles'

    def handle(self, *args, **options):
        # Create test users if they don't exist
        users_data = [
            {
                'username': 'staff_user',
                'email': 'staff@example.com',
                'password': 'testpass123',
                'role': 'staff',
                'first_name': 'John',
                'last_name': 'Staff'
            },
            {
                'username': 'approver_l1',
                'email': 'approver1@example.com',
                'password': 'testpass123',
                'role': 'approver_level_1',
                'approver_level': 1,
                'first_name': 'Jane',
                'last_name': 'Approver1'
            },
            {
                'username': 'approver_l2',
                'email': 'approver2@example.com',
                'password': 'testpass123',
                'role': 'approver_level_2',
                'approver_level': 2,
                'first_name': 'Bob',
                'last_name': 'Approver2'
            },
            {
                'username': 'finance_user',
                'email': 'finance@example.com',
                'password': 'testpass123',
                'role': 'finance',
                'first_name': 'Alice',
                'last_name': 'Finance'
            }
        ]

        for user_data in users_data:
            username = user_data['username']
            if not User.objects.filter(username=username).exists():
                User.objects.create_user(**user_data)
                self.stdout.write(
                    self.style.SUCCESS(f'Created user: {username}')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'User already exists: {username}')
                )

        self.stdout.write(
            self.style.SUCCESS('Successfully seeded test users!')
        )
