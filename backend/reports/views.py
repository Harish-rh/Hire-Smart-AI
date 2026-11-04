import csv
from datetime import datetime
from django.http import HttpResponse
from django.db.models import Count, Q
from django.utils import timezone
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from accounts.permissions import IsRecruiterOrAdmin
from jobs.models import Job
from candidates.models import Candidate
from applications.models import Application
from ai_assistant.models import ResumeAnalysis, InterviewQuestionSet
from .models import ActivityLog
from .serializers import ActivityLogSerializer

class DashboardView(APIView):
    """
    Computes real-time recruitment metrics from PostgreSQL/database records.
    Provides data for stat cards, status distributions, recent applications, and activity feed.
    """
    permission_classes = [IsRecruiterOrAdmin]

    def get(self, request):
        # 1. High-level metric counts
        total_jobs = Job.objects.count()
        open_jobs = Job.objects.filter(status=Job.Status.OPEN).count()
        total_candidates = Candidate.objects.count()
        total_applications = Application.objects.count()

        apps_in_review = Application.objects.filter(status=Application.Status.IN_REVIEW).count()
        interviews_scheduled = Application.objects.filter(status=Application.Status.INTERVIEW).count()
        completed_analyses = ResumeAnalysis.objects.filter(status=ResumeAnalysis.Status.COMPLETED).count()
        failed_analyses = ResumeAnalysis.objects.filter(status=ResumeAnalysis.Status.FAILED).count()

        # 2. Applications by status breakdown
        status_counts = (
            Application.objects.values('status')
            .annotate(count=Count('id'))
            .order_by('status')
        )
        status_dict = {item['status']: item['count'] for item in status_counts}
        applications_by_status = [
            {'status': choice[0], 'label': choice[1], 'count': status_dict.get(choice[0], 0)}
            for choice in Application.Status.choices
        ]

        # 3. Candidates per job breakdown (top 8 jobs)
        jobs_with_apps = (
            Job.objects.annotate(applicant_count=Count('applications'))
            .order_by('-applicant_count')[:8]
            .values('id', 'title', 'department', 'status', 'applicant_count')
        )

        # 4. Recent Applications (top 5)
        recent_apps_qs = (
            Application.objects.select_related('candidate', 'job')
            .order_by('-created_at')[:5]
        )
        recent_applications = [
            {
                'id': app.id,
                'candidate_id': app.candidate.id,
                'candidate_name': app.candidate.full_name,
                'candidate_email': app.candidate.email,
                'job_id': app.job.id,
                'job_title': app.job.title,
                'status': app.status,
                'status_display': app.get_status_display(),
                'applied_date': app.applied_date,
            }
            for app in recent_apps_qs
        ]

        # 5. Recently Created Jobs (top 5)
        recent_jobs_qs = Job.objects.order_by('-created_at')[:5].values(
            'id', 'title', 'department', 'status', 'min_experience', 'max_experience', 'created_at'
        )

        # 6. Recent Activity Feed (top 10)
        recent_activities = (
            ActivityLog.objects.select_related('user')
            .order_by('-created_at')[:10]
        )
        activity_feed = ActivityLogSerializer(recent_activities, many=True).data

        data = {
          'metrics': {
              'total_jobs': total_jobs,
              'open_jobs': open_jobs,
              'total_candidates': total_candidates,
              'total_applications': total_applications,
              'apps_in_review': apps_in_review,
              'interviews_scheduled': interviews_scheduled,
              'completed_analyses': completed_analyses,
              'failed_analyses': failed_analyses,
          },
          'applications_by_status': applications_by_status,
          'jobs_by_candidates': list(jobs_with_apps),
          'recent_applications': recent_applications,
          'recent_jobs': list(recent_jobs_qs),
          'activity_feed': activity_feed,
        }

        return Response(data, status=status.HTTP_200_OK)


class ApplicationReportsView(APIView):
    """
    Detailed applications recruitment report with optional CSV export.
    """
    permission_classes = [IsRecruiterOrAdmin]

    def get(self, request):
        qs = Application.objects.select_related('candidate', 'job').order_by('-created_at')

        # Filters
        job_id = request.query_params.get('job')
        if job_id and job_id.upper() != 'ALL':
            qs = qs.filter(job_id=job_id)

        app_status = request.query_params.get('status')
        if app_status and app_status.upper() != 'ALL':
            qs = qs.filter(status=app_status.upper())

        date_from = request.query_params.get('date_from')
        if date_from:
            try:
                dt = datetime.strptime(date_from, '%Y-%m-%d')
                qs = qs.filter(created_at__date__gte=dt)
            except ValueError:
                pass

        date_to = request.query_params.get('date_to')
        if date_to:
            try:
                dt = datetime.strptime(date_to, '%Y-%m-%d')
                qs = qs.filter(created_at__date__lte=dt)
            except ValueError:
                pass

        # CSV Export
        if request.query_params.get('export') == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="hiresmart_applications_report.csv"'
            writer = csv.writer(response)
            writer.writerow(['Application ID', 'Candidate Name', 'Candidate Email', 'Job Title', 'Department', 'Stage', 'Applied Date'])
            for app in qs:
                writer.writerow([
                    app.id,
                    app.candidate.full_name,
                    app.candidate.email,
                    app.job.title,
                    app.job.department,
                    app.get_status_display(),
                    app.applied_date.strftime('%Y-%m-%d %H:%M') if app.applied_date else '',
                ])
            return response

        # JSON Summary Response
        total_filtered = qs.count()
        results = [
            {
                'id': app.id,
                'candidate_name': app.candidate.full_name,
                'candidate_email': app.candidate.email,
                'job_title': app.job.title,
                'job_department': app.job.department,
                'status': app.status,
                'status_display': app.get_status_display(),
                'applied_date': app.applied_date,
            }
            for app in qs[:100]  # Cap at 100 for JSON report preview
        ]

        return Response({
            'total_count': total_filtered,
            'applications': results,
        }, status=status.HTTP_200_OK)


class JobReportsView(APIView):
    """
    Job openings report with applicant conversion statistics.
    """
    permission_classes = [IsRecruiterOrAdmin]

    def get(self, request):
        qs = Job.objects.annotate(
            total_apps=Count('applications'),
            interviews_count=Count('applications', filter=Q(applications__status='INTERVIEW')),
            offers_count=Count('applications', filter=Q(applications__status='OFFER')),
        ).order_by('-created_at')

        if request.query_params.get('export') == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="hiresmart_jobs_report.csv"'
            writer = csv.writer(response)
            writer.writerow(['Job ID', 'Title', 'Department', 'Status', 'Min Exp', 'Total Applicants', 'Interviews', 'Offers'])
            for job in qs:
                writer.writerow([
                    job.id,
                    job.title,
                    job.department,
                    job.status,
                    job.min_experience,
                    job.total_apps,
                    job.interviews_count,
                    job.offers_count,
                ])
            return response

        data = [
            {
                'id': job.id,
                'title': job.title,
                'department': job.department,
                'status': job.status,
                'min_experience': job.min_experience,
                'total_applicants': job.total_apps,
                'interviews': job.interviews_count,
                'offers': job.offers_count,
            }
            for job in qs
        ]
        return Response({'jobs': data, 'total_jobs': len(data)}, status=status.HTTP_200_OK)


class AIAnalysisReportsView(APIView):
    """
    AI screening performance and engine utilization report.
    """
    permission_classes = [IsRecruiterOrAdmin]

    def get(self, request):
        qs = ResumeAnalysis.objects.select_related('application', 'application__candidate', 'application__job').order_by('-created_at')

        total_analyses = qs.count()
        completed = qs.filter(status=ResumeAnalysis.Status.COMPLETED).count()
        failed = qs.filter(status=ResumeAnalysis.Status.FAILED).count()
        rule_based = qs.filter(is_rule_based=True).count()
        llm_assisted = qs.filter(is_rule_based=False, status=ResumeAnalysis.Status.COMPLETED).count()

        if request.query_params.get('export') == 'csv':
            response = HttpResponse(content_type='text/csv')
            response['Content-Disposition'] = 'attachment; filename="hiresmart_ai_analyses_report.csv"'
            writer = csv.writer(response)
            writer.writerow(['Analysis ID', 'Candidate Name', 'Job Title', 'Status', 'Inference Engine', 'Evidenced Count', 'Date'])
            for item in qs:
                writer.writerow([
                    item.id,
                    item.application.candidate.full_name,
                    item.application.job.title,
                    item.status,
                    item.model_name,
                    len(item.requirement_evidence) if item.requirement_evidence else 0,
                    item.created_at.strftime('%Y-%m-%d %H:%M') if item.created_at else '',
                ])
            return response

        return Response({
            'metrics': {
                'total_analyses': total_analyses,
                'completed': completed,
                'failed': failed,
                'rule_based': rule_based,
                'llm_assisted': llm_assisted,
            },
            'recent_analyses': [
                {
                    'id': a.id,
                    'candidate_name': a.application.candidate.full_name,
                    'job_title': a.application.job.title,
                    'status': a.status,
                    'model_name': a.model_name,
                    'is_rule_based': a.is_rule_based,
                    'created_at': a.created_at,
                }
                for a in qs[:20]
            ]
        }, status=status.HTTP_200_OK)
