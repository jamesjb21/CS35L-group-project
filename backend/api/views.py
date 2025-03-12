from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import MyUser
from .serializers import UserRegisterSerializer, MyUserProfileSerializer  
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

# Create your views here.
class CreateUserView(generics.CreateAPIView):
    queryset = MyUser.objects.all
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

@api_view(['GET'])
def get_user_profile_data(request, pk):
    try:
        try:
            user = MyUser.objects.get(username=pk)
        except MyUser.DoesNotExist:
            return Response({'error':'user does not exist'})
        
        serializer = MyUserProfileSerializer(user, many=False)

    except:
        return Response({'error':'error getting user data'})
    