import os
import uuid
from django.db import models

def candidate_resume_upload_path(instance, filename):
    """Generate safe, unique file path for uploaded resumes."""
    ext = filename.split('.')[-1].lower()
    unique_name = f"{uuid.uuid4().hex}.{ext}"
    return os.path.join('resumes', unique_name)

class Candidate(models.Model):
    full_name = models.CharField(max_length=255, db_index=True)
    email = models.EmailField(unique=True, db_index=True)
    phone = models.CharField(max_length=50, blank=True)
    location = models.CharField(max_length=255, blank=True)
    skills = models.JSONField(default=list, blank=True, help_text="List of candidate skills")
    experience_summary = models.TextField(blank=True)
    resume_file = models.FileField(
        upload_to=candidate_resume_upload_path,
        blank=True,
        null=True,
        help_text="Uploaded PDF or DOCX resume",
    )
    extracted_resume_text = models.TextField(
        blank=True,
        help_text="Extracted text from resume for private, offline analysis",
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.full_name} ({self.email})"
