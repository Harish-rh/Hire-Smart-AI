from django.urls import path
from .views import (
    DashboardView,
    ApplicationReportsView,
    JobReportsView,
    AIAnalysisReportsView,
)

urlpatterns = [
    path('dashboard/', DashboardView.as_view(), name='dashboard_metrics'),
    path('reports/applications/', ApplicationReportsView.as_view(), name='report_applications'),
    path('reports/jobs/', JobReportsView.as_view(), name='report_jobs'),
    path('reports/ai-analyses/', AIAnalysisReportsView.as_view(), name='report_ai_analyses'),
]
