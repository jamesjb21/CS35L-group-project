from django.urls import path
from api.views import CreateUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import get_user_profile_data

urlpatterns = [
    path('user_data/<str:pk>/', get_user_profile_data),
    path("user/signup/", CreateUserView.as_view(), name ="signup"),
    path("token/", TokenObtainPairView.as_view(), name="get_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),
]
