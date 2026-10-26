from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from jobs.models import Job
from candidates.models import Candidate
from applications.models import Application, ApplicationStatusHistory

class ApplicationAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.recruiter = User.objects.create_user(
            username='app_recruiter',
            email='recruiter@pipeline.local',
            password='Password123!',
            full_name='Pipeline Recruiter',
            role=User.Role.RECRUITER,
        )
        self.client.force_authenticate(user=self.recruiter)

        self.job = Job.objects.create(
            title='Senior React Engineer',
            department='Frontend Platform',
            description='Building UI components.',
            min_experience=3,
            status=Job.Status.OPEN,
            created_by=self.recruiter,
        )

        self.candidate1 = Candidate.objects.create(
            full_name='Maya Lin',
            email='maya@example.com',
            skills=['React', 'TypeScript'],
        )

        self.candidate2 = Candidate.objects.create(
            full_name='David Kim',
            email='david@example.com',
            skills=['Python', 'Django'],
        )

        self.app1 = Application.objects.create(
            job=self.job,
            candidate=self.candidate1,
            status=Application.Status.NEW,
            recruiter_notes='Strong candidate portfolio.',
        )

    def test_list_applications(self):
        url = reverse('application-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['candidate_name'], 'Maya Lin')

    def test_create_application(self):
        url = reverse('application-list')
        payload = {
            'job': self.job.id,
            'candidate': self.candidate2.id,
            'recruiter_notes': 'Referred by tech lead.',
            'status': 'NEW',
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['candidate'], self.candidate2.id)

        # Verify initial history record was created
        created_app = Application.objects.get(id=response.data['id'])
        self.assertTrue(created_app.status_history.filter(new_status='NEW').exists())

    def test_prevent_duplicate_application(self):
        # Candidate 1 already applied for this job
        url = reverse('application-list')
        payload = {
            'job': self.job.id,
            'candidate': self.candidate1.id,
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        # Unique constraint caught either as non_field_errors or field error
        error_str = str(response.data)
        self.assertTrue("unique" in error_str.lower() or "candidate" in error_str.lower())

    def test_filter_applications_by_status(self):
        url = f"{reverse('application-list')}?status=NEW"
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

        url_in_review = f"{reverse('application-list')}?status=IN_REVIEW"
        response_in_review = self.client.get(url_in_review)
        self.assertEqual(response_in_review.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response_in_review.data['results']), 0)

    def test_update_application_status_and_verify_history(self):
        url = reverse('application-update-status', kwargs={'pk': self.app1.id})
        payload = {
            'status': 'IN_REVIEW',
            'notes': 'Resume meets minimum experience requirement.',
        }
        response = self.client.patch(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.app1.refresh_from_db()
        self.assertEqual(self.app1.status, Application.Status.IN_REVIEW)

        # Check audit trail
        history = self.app1.status_history.filter(new_status='IN_REVIEW').first()
        self.assertIsNotNone(history)
        self.assertEqual(history.old_status, 'NEW')
        self.assertEqual(history.new_status, 'IN_REVIEW')
        self.assertEqual(history.changed_by, self.recruiter)
        self.assertEqual(history.notes, 'Resume meets minimum experience requirement.')

    def test_get_application_history_endpoint(self):
        ApplicationStatusHistory.objects.create(
            application=self.app1,
            old_status='NEW',
            new_status='SHORTLISTED',
            changed_by=self.recruiter,
            notes='Fast-tracked by engineering manager.',
        )

        url = reverse('application-history', kwargs={'pk': self.app1.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['new_status'], 'SHORTLISTED')

    def test_unauthenticated_user_rejected(self):
        self.client.logout()
        url = reverse('application-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
