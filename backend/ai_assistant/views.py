from rest_framework import viewsets, permissions, status
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from accounts.permissions import IsRecruiterOrAdmin
from applications.models import Application
from reports.models import ActivityLog
from .models import ResumeAnalysis
from .serializers import ResumeAnalysisSerializer
from .ai_service import check_ollama_health, run_resume_analysis

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')


class AIHealthView(APIView):
    """Returns local AI availability status and model installation info."""
    permission_classes = [IsRecruiterOrAdmin]

    def get(self, request):
        health_data = check_ollama_health()
        return Response(health_data, status=status.HTTP_200_OK)


class AnalyzeApplicationView(APIView):
    """Triggers local AI or rule-based resume screening for a candidate application."""
    permission_classes = [IsRecruiterOrAdmin]

    def post(self, request, pk):
        app = get_object_or_404(Application, pk=pk)
        
        # Log analysis request
        try:
            ActivityLog.objects.create(
                user=request.user,
                action='AI_ANALYSIS_STARTED',
                details={
                    'application_id': app.id,
                    'candidate_name': app.candidate.full_name,
                    'job_title': app.job.title,
                },
                ip_address=get_client_ip(request),
            )
        except Exception:
            pass

        analysis = run_resume_analysis(app)

        # Log completion
        try:
            ActivityLog.objects.create(
                user=request.user,
                action='AI_ANALYSIS_COMPLETED',
                details={
                    'application_id': app.id,
                    'analysis_id': analysis.id,
                    'model_name': analysis.model_name,
                    'is_rule_based': analysis.is_rule_based,
                    'status': analysis.status,
                },
                ip_address=get_client_ip(request),
            )
        except Exception:
            pass

        serializer = ResumeAnalysisSerializer(analysis)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ResumeAnalysisViewSet(viewsets.ReadOnlyModelViewSet):
    """View and retry previous resume analysis results."""
    queryset = ResumeAnalysis.objects.all().select_related(
        'application', 'application__candidate', 'application__job'
    ).order_by('-created_at')
    serializer_class = ResumeAnalysisSerializer
    permission_classes = [IsRecruiterOrAdmin]

    @action(detail=True, methods=['post'], url_path='retry')
    def retry(self, request, pk=None):
        """Re-runs analysis on the target application."""
        prev_analysis = self.get_object()
        app = prev_analysis.application
        new_analysis = run_resume_analysis(app)
        serializer = ResumeAnalysisSerializer(new_analysis)
        return Response(serializer.data, status=status.HTTP_200_OK)
