from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AIHealthView,
    AnalyzeApplicationView,
    ResumeAnalysisViewSet,
    GenerateInterviewQuestionsView,
    InterviewQuestionSetViewSet,
)

router = DefaultRouter()
router.register(r'analyses', ResumeAnalysisViewSet, basename='analysis')
router.register(r'interviews', InterviewQuestionSetViewSet, basename='interview-questions')

urlpatterns = [
    path('ai/health/', AIHealthView.as_view(), name='ai_health'),
    path('applications/<int:pk>/analyze/', AnalyzeApplicationView.as_view(), name='analyze_application'),
    path('interviews/generate/', GenerateInterviewQuestionsView.as_view(), name='generate_interviews'),
    path('', include(router.urls)),
]
