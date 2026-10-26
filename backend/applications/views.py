from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import IsRecruiterOrAdmin
from reports.models import ActivityLog
from .models import Application, ApplicationStatusHistory
from .serializers import (
    ApplicationSerializer,
    CreateApplicationSerializer,
    UpdateStatusSerializer,
    ApplicationStatusHistorySerializer,
)

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')


class ApplicationViewSet(viewsets.ModelViewSet):
    """
    Recruitment Pipeline Application ViewSet.
    Tracks candidate progress through stages with complete audit history.
    """
    queryset = (
        Application.objects.all()
        .select_related('job', 'candidate')
        .prefetch_related('resume_analyses', 'status_history')
        .order_by('-created_at')
    )
    permission_classes = [IsRecruiterOrAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = [
        'candidate__full_name',
        'candidate__email',
        'job__title',
        'job__department',
        'recruiter_notes',
    ]
    ordering_fields = ['created_at', 'applied_date', 'status']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateApplicationSerializer
        return ApplicationSerializer

    def get_queryset(self):
        queryset = super().get_queryset()

        # Filter by stage / status
        app_status = self.request.query_params.get('status')
        if app_status and app_status.upper() != 'ALL':
            queryset = queryset.filter(status=app_status.upper())

        # Filter by job ID
        job_id = self.request.query_params.get('job')
        if job_id and job_id.upper() != 'ALL':
            queryset = queryset.filter(job_id=job_id)

        # Filter by candidate ID
        candidate_id = self.request.query_params.get('candidate')
        if candidate_id:
            queryset = queryset.filter(candidate_id=candidate_id)

        return queryset

    def perform_create(self, serializer):
        app = serializer.save()

        # Record initial status in history
        ApplicationStatusHistory.objects.create(
            application=app,
            old_status='NONE',
            new_status=app.status,
            changed_by=self.request.user,
            notes='Initial candidate application created in recruitment pipeline.',
        )

        try:
            ActivityLog.objects.create(
                user=self.request.user,
                action='APPLICATION_CREATED',
                details={
                    'application_id': app.id,
                    'job_title': app.job.title,
                    'candidate_name': app.candidate.full_name,
                    'initial_status': app.status,
                },
                ip_address=get_client_ip(self.request),
            )
        except Exception:
            pass

    @action(detail=True, methods=['patch'], url_path='status')
    def update_status(self, request, pk=None):
        """Update candidate application stage and append to status audit history."""
        app = self.get_object()
        serializer = UpdateStatusSerializer(data=request.data)

        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        new_status = serializer.validated_data['status']
        notes = serializer.validated_data.get('notes', '')
        old_status = app.status

        if old_status == new_status:
            return Response(
                {'message': f"Application is already in '{app.get_status_display()}' stage.", 'application': ApplicationSerializer(app).data},
                status=status.HTTP_200_OK,
            )

        # 1. Update application status
        app.status = new_status
        app.save()

        # 2. Record audit trail
        history_entry = ApplicationStatusHistory.objects.create(
            application=app,
            old_status=old_status,
            new_status=new_status,
            changed_by=request.user,
            notes=notes,
        )

        # 3. Log activity
        try:
            ActivityLog.objects.create(
                user=request.user,
                action='APPLICATION_STATUS_CHANGED',
                details={
                    'application_id': app.id,
                    'candidate_name': app.candidate.full_name,
                    'job_title': app.job.title,
                    'from_status': old_status,
                    'to_status': new_status,
                    'notes': notes,
                },
                ip_address=get_client_ip(request),
            )
        except Exception:
            pass

        return Response(
            {
                'message': f"Status updated to '{app.get_status_display()}'.",
                'application': ApplicationSerializer(app).data,
                'history_entry': ApplicationStatusHistorySerializer(history_entry).data,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=['get'], url_path='history')
    def history(self, request, pk=None):
        """Retrieve chronological status change audit trail for this application."""
        app = self.get_object()
        history_qs = app.status_history.all().order_by('-created_at')
        serializer = ApplicationStatusHistorySerializer(history_qs, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
