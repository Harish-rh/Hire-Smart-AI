from rest_framework import viewsets, permissions, status, filters
from rest_framework.views import APIView
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from accounts.permissions import IsRecruiterOrAdmin
from applications.models import Application
from jobs.models import Job
from candidates.models import Candidate
from reports.models import ActivityLog
from .models import ResumeAnalysis, InterviewQuestionSet
from .serializers import ResumeAnalysisSerializer, InterviewQuestionSetSerializer
from .ai_service import check_ollama_health, run_resume_analysis
from .interview_service import generate_interview_question_set

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


class GenerateInterviewQuestionsView(APIView):
    """
    Generates technical interview questions for a selected job opening and candidate.
    Uses Ollama or verified question bank fallback.
    """
    permission_classes = [IsRecruiterOrAdmin]

    def post(self, request):
        job_id = request.data.get('job')
        if not job_id:
            return Response({'job': 'A target job opening is required.'}, status=status.HTTP_400_BAD_REQUEST)

        job = get_object_or_404(Job, pk=job_id)
        
        candidate_id = request.data.get('candidate')
        candidate = None
        if candidate_id:
            candidate = get_object_or_404(Candidate, pk=candidate_id)

        topic = request.data.get('topic', 'Python')
        difficulty = request.data.get('difficulty', 'INTERMEDIATE')
        count = int(request.data.get('count', 3))
        count = max(1, min(count, 10))  # Bound between 1 and 10

        # Generate question set
        gen_result = generate_interview_question_set(
            job=job,
            candidate=candidate,
            topic=topic,
            difficulty=difficulty,
            count=count,
            user=request.user,
        )

        # Persist generated question set
        question_set = InterviewQuestionSet.objects.create(
            job=job,
            candidate=candidate,
            topic=gen_result['topic'],
            difficulty=gen_result['difficulty'],
            questions=gen_result['questions'],
            is_ai_generated=gen_result['is_ai_generated'],
            created_by=request.user,
        )

        try:
            ActivityLog.objects.create(
                user=request.user,
                action='INTERVIEW_QUESTIONS_GENERATED',
                details={
                    'question_set_id': question_set.id,
                    'topic': topic,
                    'job_title': job.title,
                    'is_ai_generated': gen_result['is_ai_generated'],
                    'question_count': len(gen_result['questions']),
                },
                ip_address=get_client_ip(request),
            )
        except Exception:
            pass

        serializer = InterviewQuestionSetSerializer(question_set)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class InterviewQuestionSetViewSet(viewsets.ModelViewSet):
    """
    Manage saved interview question sets (list, inspect, edit questions, delete).
    """
    queryset = InterviewQuestionSet.objects.all().select_related('job', 'candidate', 'created_by').order_by('-created_at')
    serializer_class = InterviewQuestionSetSerializer
    permission_classes = [IsRecruiterOrAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['topic', 'job__title', 'candidate__full_name']
    ordering_fields = ['created_at', 'topic', 'difficulty']
    ordering = ['-created_at']

    def perform_destroy(self, instance):
        set_id = instance.id
        topic = instance.topic
        instance.delete()
        try:
            ActivityLog.objects.create(
                user=self.request.user,
                action='INTERVIEW_QUESTIONS_DELETED',
                details={'question_set_id': set_id, 'topic': topic},
                ip_address=get_client_ip(self.request),
            )
        except Exception:
            pass
