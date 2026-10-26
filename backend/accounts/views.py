from rest_framework import status, permissions, viewsets
from rest_framework.views import APIView
from rest_framework.response import Response
from reports.models import ActivityLog
from .models import User
from .serializers import (
    UserSerializer,
    LoginSerializer,
    CreateUserSerializer,
    UpdateProfileSerializer,
    ChangePasswordSerializer,
)
from .permissions import IsAdmin

def get_client_ip(request):
    """Safely extract client IP from request headers."""
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        return x_forwarded_for.split(',')[0].strip()
    return request.META.get('REMOTE_ADDR', '')


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            data = serializer.validated_data
            user_data = data['user']
            
            # Log login activity
            try:
                user = User.objects.get(id=user_data['id'])
                ActivityLog.objects.create(
                    user=user,
                    action='USER_LOGIN',
                    details={'username': user.username, 'role': user.role},
                    ip_address=get_client_ip(request),
                )
            except Exception:
                pass

            return Response(data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            ActivityLog.objects.create(
                user=request.user,
                action='USER_LOGOUT',
                details={'username': request.user.username},
                ip_address=get_client_ip(request),
            )
        except Exception:
            pass
        return Response({'message': 'Logged out successfully.'}, status=status.HTTP_200_OK)


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def patch(self, request):
        serializer = UpdateProfileSerializer(request.user, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(request.user).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            
            try:
                ActivityLog.objects.create(
                    user=request.user,
                    action='PASSWORD_CHANGED',
                    details={'username': request.user.username},
                    ip_address=get_client_ip(request),
                )
            except Exception:
                pass

            return Response({'message': 'Password updated successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserManagementViewSet(viewsets.ModelViewSet):
    """Admin-only user management (list, create, edit, deactivate)."""
    queryset = User.objects.all().order_by('-created_at')
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.action == 'create':
            return CreateUserSerializer
        return UserSerializer

    def perform_create(self, serializer):
        user = serializer.save()
        try:
            ActivityLog.objects.create(
                user=self.request.user,
                action='USER_CREATED',
                details={'created_username': user.username, 'role': user.role},
                ip_address=get_client_ip(self.request),
            )
        except Exception:
            pass
