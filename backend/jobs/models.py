from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError

class Job(models.Model):
    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        OPEN = 'OPEN', 'Open'
        ON_HOLD = 'ON_HOLD', 'On Hold'
        CLOSED = 'CLOSED', 'Closed'
        ARCHIVED = 'ARCHIVED', 'Archived'

    class EmploymentType(models.TextChoices):
        FULL_TIME = 'FULL_TIME', 'Full-time'
        PART_TIME = 'PART_TIME', 'Part-time'
        CONTRACT = 'CONTRACT', 'Contract'
        INTERNSHIP = 'INTERNSHIP', 'Internship'
        REMOTE = 'REMOTE', 'Remote'

    title = models.CharField(max_length=255, db_index=True)
    department = models.CharField(max_length=150, db_index=True)
    description = models.TextField()
    required_skills = models.JSONField(default=list, help_text="List of mandatory technical skills")
    preferred_skills = models.JSONField(default=list, blank=True, help_text="List of preferred qualifications")
    min_experience = models.PositiveIntegerField(default=0, help_text="Minimum years of experience required")
    max_experience = models.PositiveIntegerField(default=0, help_text="Maximum years of experience (0 for no limit)")
    employment_type = models.CharField(
        max_length=50,
        choices=EmploymentType.choices,
        default=EmploymentType.FULL_TIME,
    )
    location = models.CharField(max_length=255, default='Remote')
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.OPEN,
        db_index=True,
    )
    created_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='created_jobs',
    )
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def clean(self):
        super().clean()
        if self.max_experience > 0 and self.min_experience > self.max_experience:
            raise ValidationError({
                'min_experience': "Minimum experience cannot exceed maximum experience."
            })

    def __str__(self):
        return f"{self.title} ({self.department}) - {self.get_status_display()}"
