from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from jobs.models import Job
from candidates.models import Candidate
from applications.models import Application

class JobAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.recruiter = User.objects.create_user(
            username='job_recruiter',
            email='recruiter@test.com',
            password='Password123!',
            full_name='Job Recruiter',
            role=User.Role.RECRUITER,
        )
        self.client.force_authenticate(user=self.recruiter)

        self.job1 = Job.objects.create(
            title='Frontend Engineer',
            department='Design & Tech',
            description='Build UI components with React.',
            required_skills=['React', 'JavaScript', 'Tailwind CSS'],
            min_experience=2,
            max_experience=5,
            status=Job.Status.OPEN,
            created_by=self.recruiter,
        )

        self.job2 = Job.objects.create(
            title='Backend Architect',
            department='Core Systems',
            description='Build REST APIs with Django.',
            required_skills=['Python', 'Django', 'PostgreSQL'],
            min_experience=5,
            max_experience=10,
            status=Job.Status.DRAFT,
            created_by=self.recruiter,
        )

    def test_list_jobs(self):
        url = reverse('job-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 2)

    def test_filter_jobs_by_status(self):
        url = f"{reverse('job-list')}?status=OPEN"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Frontend Engineer')

    def test_search_jobs_by_keyword(self):
        url = f"{reverse('job-list')}?search=Architect"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['title'], 'Backend Architect')

    def test_create_job_success(self):
        url = reverse('job-list')
        payload = {
            'title': 'AI Integration Engineer',
            'department': 'Machine Intelligence',
            'description': 'Deploy small local LLMs with Ollama and Python.',
            'required_skills': ['Python', 'Ollama', 'Prompt Engineering'],
            'preferred_skills': ['Docker', 'PyTorch'],
            'min_experience': 2,
            'max_experience': 6,
            'employment_type': 'FULL_TIME',
            'location': 'Remote',
            'status': 'OPEN',
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'AI Integration Engineer')
        self.assertEqual(response.data['created_by_name'], 'Job Recruiter')

    def test_create_job_invalid_experience_range(self):
        url = reverse('job-list')
        payload = {
            'title': 'Invalid Exp Job',
            'department': 'Testing',
            'description': 'Experience range test.',
            'min_experience': 8,
            'max_experience': 3,  # Invalid: min > max
            'required_skills': ['Python'],
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('min_experience', response.data)

    def test_update_job(self):
        url = reverse('job-detail', kwargs={'pk': self.job1.id})
        response = self.client.patch(url, {'status': 'CLOSED'}, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.job1.refresh_from_db()
        self.assertEqual(self.job1.status, Job.Status.CLOSED)

    def test_delete_job(self):
        url = reverse('job-detail', kwargs={'pk': self.job2.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Job.objects.filter(id=self.job2.id).exists())

    def test_job_applications_endpoint(self):
        candidate = Candidate.objects.create(
            full_name='Test Applicant',
            email='applicant@example.com',
            skills=['React'],
        )
        Application.objects.create(
            job=self.job1,
            candidate=candidate,
            status=Application.Status.NEW,
        )

        url = reverse('job-applications', kwargs={'pk': self.job1.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['candidate_name'], 'Test Applicant')

    def test_unauthenticated_request_rejected(self):
        self.client.logout()
        url = reverse('job-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
