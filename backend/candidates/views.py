from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from accounts.permissions import IsRecruiterOrAdmin
from reports.models import ActivityLog
from .models import Candidate
from .serializers import CandidateSerializer, ResumeUploadSerializer
from .services import extract_text_from_resume, ResumeExtractionError

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')


class CandidateViewSet(viewsets.ModelViewSet):
    """
    Candidate Management ViewSet.
    Supports search, resume file upload (PDF/DOCX), and pure-python text extraction.
    """
    queryset = Candidate.objects.all().prefetch_related('applications').order_by('-created_at')
    serializer_class = CandidateSerializer
    permission_classes = [IsRecruiterOrAdmin]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['full_name', 'email', 'location', 'skills', 'experience_summary']
    ordering_fields = ['created_at', 'full_name', 'email']
    ordering = ['-created_at']

    def perform_create(self, serializer):
        candidate = serializer.save()
        try:
            ActivityLog.objects.create(
                user=self.request.user,
                action='CANDIDATE_CREATED',
                details={'candidate_id': candidate.id, 'name': candidate.full_name, 'email': candidate.email},
                ip_address=get_client_ip(self.request),
            )
        except Exception:
            pass

    def perform_update(self, serializer):
        candidate = serializer.save()
        try:
            ActivityLog.objects.create(
                user=self.request.user,
                action='CANDIDATE_UPDATED',
                details={'candidate_id': candidate.id, 'name': candidate.full_name},
                ip_address=get_client_ip(self.request),
            )
        except Exception:
            pass

    def perform_destroy(self, instance):
        cand_id = instance.id
        cand_name = instance.full_name
        
        # Clean up file on disk if exists
        if instance.resume_file:
            instance.resume_file.delete(save=False)

        instance.delete()
        try:
            ActivityLog.objects.create(
                user=self.request.user,
                action='CANDIDATE_DELETED',
                details={'candidate_id': cand_id, 'name': cand_name},
                ip_address=get_client_ip(self.request),
            )
        except Exception:
            pass

    @action(detail=True, methods=['post'], url_path='upload-resume')
    def upload_resume(self, request, pk=None):
        """
        Uploads and processes a candidate resume (PDF or DOCX).
        Extracts selectable text and persists it securely in the database.
        """
        candidate = self.get_object()
        serializer = ResumeUploadSerializer(data=request.data)
        
        if not serializer.is_valid():
            resume_errs = serializer.errors.get('resume')
            if resume_errs:
                err_text = str(resume_errs[0])
            else:
                err_text = str(serializer.errors)
            return Response({'error': err_text}, status=status.HTTP_400_BAD_REQUEST)

        uploaded_file = serializer.validated_data['resume']

        try:
            # 1. Extract text using pure-Python extractor
            extracted_text = extract_text_from_resume(uploaded_file)

            # 2. Delete old resume file if replacing
            if candidate.resume_file:
                candidate.resume_file.delete(save=False)

            # 3. Save new file and extracted text
            candidate.resume_file = uploaded_file
            candidate.extracted_resume_text = extracted_text
            candidate.save()

            # 4. Audit Log
            try:
                ActivityLog.objects.create(
                    user=request.user,
                    action='RESUME_UPLOADED',
                    details={
                        'candidate_id': candidate.id,
                        'name': candidate.full_name,
                        'filename': uploaded_file.name,
                        'text_length': len(extracted_text),
                    },
                    ip_address=get_client_ip(request),
                )
            except Exception:
                pass

            return Response({
                'message': 'Resume uploaded and extracted successfully.',
                'candidate': CandidateSerializer(candidate).data,
                'extracted_text_snippet': extracted_text[:500] if extracted_text else '',
            }, status=status.HTTP_200_OK)

        except ResumeExtractionError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({'error': f"Failed to process resume: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    @action(detail=True, methods=['get'], url_path='resume-text')
    def get_resume_text(self, request, pk=None):
        """Retrieve the private extracted resume text for this candidate."""
        candidate = self.get_object()
        return Response({
            'candidate_id': candidate.id,
            'candidate_name': candidate.full_name,
            'has_resume': bool(candidate.resume_file),
            'extracted_text': candidate.extracted_resume_text,
        }, status=status.HTTP_200_OK)
