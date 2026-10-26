from django.db import models
from django.conf import settings
from django.utils import timezone
from jobs.models import Job
from candidates.models import Candidate

class Application(models.Model):
    class Status(models.TextChoices):
        NEW = 'NEW', 'New'
        IN_REVIEW = 'IN_REVIEW', 'In Review'
        SHORTLISTED = 'SHORTLISTED', 'Shortlisted'
        INTERVIEW = 'INTERVIEW', 'Interview'
        OFFER = 'OFFER', 'Offer'
        REJECTED = 'REJECTED', 'Rejected'
        WITHDRAWN = 'WITHDRAWN', 'Withdrawn'

    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    candidate = models.ForeignKey(Candidate, on_delete=models.CASCADE, related_name='applications')
    status = models.CharField(
        max_length=25,
        choices=Status.choices,
        default=Status.NEW,
        db_index=True,
    )
    applied_date = models.DateTimeField(default=timezone.now)
    recruiter_notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
        constraints = [
            models.UniqueConstraint(
                fields=['job', 'candidate'],
                name='unique_job_candidate_application'
            )
        ]

    def __str__(self):
        return f"{self.candidate.full_name} -> {self.job.title} [{self.get_status_display()}]"


class ApplicationStatusHistory(models.Model):
    application = models.ForeignKey(
        Application,
        on_delete=models.CASCADE,
        related_name='status_history',
    )
    old_status = models.CharField(max_length=25, choices=Application.Status.choices)
    new_status = models.CharField(max_length=25, choices=Application.Status.choices)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='status_changes',
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Application #{self.application_id}: {self.old_status} -> {self.new_status} at {self.created_at}"
