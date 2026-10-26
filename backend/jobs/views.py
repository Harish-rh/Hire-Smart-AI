from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from accounts.permissions import IsRecruiterOrAdmin
from reports.models import ActivityLog
from .models import Job
from .serializers import JobSerializer

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')


class JobViewSet(viewsets.ModelViewSet):
    """
    Complete CRUD viewset for Job openings.
    Supports search, status filtering, and associated candidate applications.
    """
    queryset = Job.objects.all().select_related('created_by').prefetch_related('applications')
    serializer_class = JobSerializer
    permission_classes = [IsRecruiterOrAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'department', 'description', 'location']
    ordering_fields = ['created_at', 'title', 'department', 'min_experience']
    ordering = ['-created_at']

    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status
        job_status = self.request.query_params.get('status')
        if job_status and job_status.upper() != 'ALL':
            queryset = queryset.filter(status=job_status.upper())

        # Filter by department
        department = self.request.query_params.get('department')
        if department and department.upper() != 'ALL':
            queryset = queryset.filter(department__iexact=department)

        return queryset

    def perform_create(self, serializer):
        job = serializer.save(created_by=self.request.user)
        try:
            ActivityLog.objects.create(
                user=self.request.user,
                action='JOB_CREATED',
                details={'job_id': job.id, 'title': job.title, 'department': job.department},
                ip_address=get_client_ip(self.request),
            )
        except Exception:
            pass

    def perform_update(self, serializer):
        job = serializer.save()
        try:
            ActivityLog.objects.create(
                user=self.request.user,
                action='JOB_UPDATED',
                details={'job_id': job.id, 'title': job.title, 'status': job.status},
                ip_address=get_client_ip(self.request),
            )
        except Exception:
            pass

    def perform_destroy(self, instance):
        job_id = instance.id
        job_title = instance.title
        instance.delete()
        try:
            ActivityLog.objects.create(
                user=self.request.user,
                action='JOB_DELETED',
                details={'job_id': job_id, 'title': job_title},
                ip_address=get_client_ip(self.request),
            )
        except Exception:
            pass

    @action(detail=True, methods=['get'])
    def applications(self, request, pk=None):
        """Retrieve all applications linked to this job opening."""
        job = self.get_object()
        apps = job.applications.all().select_related('candidate').order_by('-created_at')
        
        data = [
            {
                'id': app.id,
                'candidate_id': app.candidate.id,
                'candidate_name': app.candidate.full_name,
                'candidate_email': app.candidate.email,
                'candidate_phone': app.candidate.phone,
                'candidate_location': app.candidate.location,
                'candidate_skills': app.candidate.skills,
                'has_resume': bool(app.candidate.resume_file),
                'status': app.status,
                'status_display': app.get_status_display(),
                'applied_date': app.applied_date,
                'recruiter_notes': app.recruiter_notes,
            }
            for app in apps
        ]
        return Response(data, status=status.HTTP_200_OK)
