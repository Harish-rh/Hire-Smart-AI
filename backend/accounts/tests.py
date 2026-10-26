from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from reports.models import ActivityLog
from .models import User

class AuthenticationTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.admin_user = User.objects.create_user(
            username='admin_test',
            email='admin@test.com',
            password='TestPassword123!',
            full_name='Test Admin',
            role=User.Role.ADMIN,
        )
        self.recruiter_user = User.objects.create_user(
            username='recruiter_test',
            email='recruiter@test.com',
            password='TestPassword123!',
            full_name='Test Recruiter',
            role=User.Role.RECRUITER,
        )

    def test_login_successful(self):
        url = reverse('auth_login')
        response = self.client.post(url, {
            'username': 'admin_test',
            'password': 'TestPassword123!',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['username'], 'admin_test')
        self.assertEqual(response.data['user']['role'], User.Role.ADMIN)

        # Check ActivityLog
        self.assertTrue(ActivityLog.objects.filter(action='USER_LOGIN', user=self.admin_user).exists())

    def test_login_invalid_password(self):
        url = reverse('auth_login')
        response = self.client.post(url, {
            'username': 'admin_test',
            'password': 'WrongPassword123!',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_get_current_user_profile(self):
        self.client.force_authenticate(user=self.recruiter_user)
        url = reverse('auth_me')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'recruiter_test')
        self.assertEqual(response.data['role'], User.Role.RECRUITER)

    def test_update_user_profile(self):
        self.client.force_authenticate(user=self.recruiter_user)
        url = reverse('auth_me')
        response = self.client.patch(url, {
            'full_name': 'Updated Recruiter Name'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['full_name'], 'Updated Recruiter Name')

    def test_change_password(self):
        self.client.force_authenticate(user=self.recruiter_user)
        url = reverse('auth_change_password')
        response = self.client.post(url, {
            'old_password': 'TestPassword123!',
            'new_password': 'BrandNewPassword999!',
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.recruiter_user.refresh_from_db()
        self.assertTrue(self.recruiter_user.check_password('BrandNewPassword999!'))

    def test_admin_can_manage_users(self):
        self.client.force_authenticate(user=self.admin_user)
        url = reverse('manage-users-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        # Admin creates new user
        create_res = self.client.post(url, {
            'username': 'new_recruiter',
            'email': 'new_recruiter@test.com',
            'full_name': 'New Recruiter Person',
            'role': User.Role.RECRUITER,
            'password': 'SecurePassword123!',
        }, format='json')
        self.assertEqual(create_res.status_code, status.HTTP_201_CREATED)

    def test_recruiter_cannot_manage_users(self):
        self.client.force_authenticate(user=self.recruiter_user)
        url = reverse('manage-users-list')
        response = self.client.get(url)
        # Recruiter forbidden from user management
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
