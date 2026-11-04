from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from accounts.models import User
from jobs.models import Job
from candidates.models import Candidate
from applications.models import Application
from ai_assistant.models import ResumeAnalysis
from reports.models import ActivityLog

class DashboardAndReportsTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.recruiter = User.objects.create_user(
            username='reports_recruiter',
            email='recruiter@reports.local',
            password='Password123!',
            full_name='Reports Recruiter',
            role=User.Role.RECRUITER,
        )
        self.client.force_authenticate(user=self.recruiter)

        self.job1 = Job.objects.create(
            title='Python Full Stack Dev',
            department='Engineering',
            status=Job.Status.OPEN,
            created_by=self.recruiter,
        )
        self.job2 = Job.objects.create(
            title='UI/UX Designer',
            department='Design',
            status=Job.Status.DRAFT,
            created_by=self.recruiter,
        )

        self.candidate = Candidate.objects.create(
            full_name='Elena Rostova',
            email='elena@example.com',
            skills=['Python', 'Django'],
        )

        self.app = Application.objects.create(
            job=self.job1,
            candidate=self.candidate,
            status=Application.Status.INTERVIEW,
        )

        self.analysis = ResumeAnalysis.objects.create(
            application=self.app,
            status=ResumeAnalysis.Status.COMPLETED,
            summary="Candidate meets all qualifications.",
            skills_found=['Python'],
            is_rule_based=True,
        )

        ActivityLog.objects.create(
            user=self.recruiter,
            action='TEST_ACTION',
            details={'info': 'Initial test log'},
            ip_address='127.0.0.1',
        )

    def test_dashboard_metrics_calculation(self):
        url = reverse('dashboard_metrics')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        metrics = response.data['metrics']
        self.assertEqual(metrics['total_jobs'], 2)
        self.assertEqual(metrics['open_jobs'], 1)
        self.assertEqual(metrics['total_candidates'], 1)
        self.assertEqual(metrics['total_applications'], 1)
        self.assertEqual(metrics['interviews_scheduled'], 1)
        self.assertEqual(metrics['completed_analyses'], 1)

        self.assertEqual(len(response.data['applications_by_status']), 7)
        self.assertGreaterEqual(len(response.data['recent_applications']), 1)
        self.assertGreaterEqual(len(response.data['activity_feed']), 1)

    def test_application_reports_json(self):
        url = reverse('report_applications')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_count'], 1)
        self.assertEqual(response.data['applications'][0]['candidate_name'], 'Elena Rostova')

    def test_application_reports_csv_export(self):
        url = f"{reverse('report_applications')}?export=csv"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'text/csv')
        self.assertIn('Elena Rostova', response.content.decode('utf-8'))

    def test_job_reports(self):
        url = reverse('report_jobs')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['total_jobs'], 2)

    def test_ai_analysis_reports(self):
        url = reverse('report_ai_analyses')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['metrics']['total_analyses'], 1)
        self.assertEqual(response.data['metrics']['rule_based'], 1)
