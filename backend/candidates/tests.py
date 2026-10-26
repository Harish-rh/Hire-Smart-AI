import io
import os
from django.test import TestCase
from django.urls import reverse
from django.core.files.uploadedfile import SimpleUploadedFile
from rest_framework.test import APIClient
from rest_framework import status
import docx
from accounts.models import User
from candidates.models import Candidate

class CandidateAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.recruiter = User.objects.create_user(
            username='cand_recruiter',
            email='recruiter@candidates.local',
            password='Password123!',
            full_name='Recruiter Person',
            role=User.Role.RECRUITER,
        )
        self.client.force_authenticate(user=self.recruiter)

        self.candidate1 = Candidate.objects.create(
            full_name='Alice Developer',
            email='alice@example.com',
            phone='+1 555-0101',
            location='Seattle, WA',
            skills=['Python', 'Django', 'React'],
            experience_summary='4 years building web apps.',
        )

    def test_list_candidates(self):
        url = reverse('candidate-list')
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
        self.assertEqual(response.data['results'][0]['full_name'], 'Alice Developer')

    def test_search_candidates_by_skill(self):
        url = f"{reverse('candidate-list')}?search=React"
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)

    def test_create_candidate(self):
        url = reverse('candidate-list')
        payload = {
            'full_name': 'Bob Smith',
            'email': 'bob@example.com',
            'phone': '+1 555-0202',
            'location': 'Denver, CO',
            'skills': ['JavaScript', 'Node.js', 'PostgreSQL'],
            'experience_summary': 'Full stack developer with database background.',
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['full_name'], 'Bob Smith')

    def test_create_candidate_duplicate_email_fails(self):
        url = reverse('candidate-list')
        payload = {
            'full_name': 'Duplicate Alice',
            'email': 'alice@example.com',  # Already exists
        }
        response = self.client.post(url, payload, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_upload_docx_resume_and_extract_text(self):
        # Create an in-memory DOCX document with text
        doc = docx.Document()
        doc.add_paragraph("Alice Developer - Senior Software Engineer")
        doc.add_paragraph("Technical Experience: Built Django REST backend and React dashboards.")
        docx_buf = io.BytesIO()
        doc.save(docx_buf)
        docx_buf.seek(0)

        uploaded_file = SimpleUploadedFile(
            name="alice_resume.docx",
            content=docx_buf.read(),
            content_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        )

        url = reverse('candidate-upload-resume', kwargs={'pk': self.candidate1.id})
        response = self.client.post(url, {'resume': uploaded_file}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.candidate1.refresh_from_db()
        self.assertTrue(bool(self.candidate1.resume_file))
        self.assertIn("Senior Software Engineer", self.candidate1.extracted_resume_text)
        self.assertIn("Django REST backend", self.candidate1.extracted_resume_text)

    def test_upload_unsupported_file_format_fails(self):
        invalid_file = SimpleUploadedFile(
            name="dangerous_script.exe",
            content=b"MZ\x90\x00\x03\x00\x00\x00",
            content_type="application/octet-stream",
        )

        url = reverse('candidate-upload-resume', kwargs={'pk': self.candidate1.id})
        response = self.client.post(url, {'resume': invalid_file}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Unsupported file format", response.data['error'])

    def test_upload_empty_file_fails(self):
        empty_file = SimpleUploadedFile(
            name="empty_resume.pdf",
            content=b"",
            content_type="application/pdf",
        )

        url = reverse('candidate-upload-resume', kwargs={'pk': self.candidate1.id})
        response = self.client.post(url, {'resume': empty_file}, format='multipart')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("empty", response.data['error'].lower())

    def test_get_resume_text_endpoint(self):
        self.candidate1.extracted_resume_text = "Extracted resume content sample."
        self.candidate1.save()

        url = reverse('candidate-get-resume-text', kwargs={'pk': self.candidate1.id})
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['extracted_text'], "Extracted resume content sample.")

    def test_delete_candidate(self):
        url = reverse('candidate-detail', kwargs={'pk': self.candidate1.id})
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Candidate.objects.filter(id=self.candidate1.id).exists())
