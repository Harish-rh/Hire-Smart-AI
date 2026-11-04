from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AIHealthView, AnalyzeApplicationView, ResumeAnalysisViewSet

router = DefaultRouter()
router.register(r'analyses', ResumeAnalysisViewSet, basename='analysis')

urlpatterns = [
    path('ai/health/', AIHealthView.as_view(), name='ai_health'),
    path('applications/<int:pk>/analyze/', AnalyzeApplicationView.as_view(), name='analyze_application'),
    path('', include(router.urls)),
]
