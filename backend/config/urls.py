"""
URL configuration for HireSmart AI project.
"""

from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.conf import settings

def health_check(request):
    """Simple API health check endpoint."""
    return JsonResponse({
        'status': 'healthy',
        'app': 'HireSmart AI API',
        'debug': settings.DEBUG,
        'database_engine': settings.DATABASES['default']['ENGINE'].split('.')[-1],
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='api_health_check'),
    path('api/auth/', include('accounts.urls')),
    path('api/jobs/', include('jobs.urls')),
    path('api/candidates/', include('candidates.urls')),
    path('api/applications/', include('applications.urls')),
    path('api/', include('ai_assistant.urls')),
]
