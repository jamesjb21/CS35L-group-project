from django.shortcuts import render, get_object_or_404
from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import MyUser, Post, Like, Comment
from .serializers import (
    UserRegisterSerializer, 
    MyUserProfileSerializer,
    PostSerializer,
    PostCreateSerializer,
    CommentSerializer,
    LikeSerializer
)
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q

"""
API Views for the Social Cooking App
This module contains all the API endpoints for the cooking social network application,
including user management, posts, likes, comments, and search functionality.
"""

class CreateUserView(generics.CreateAPIView):
    """
    API endpoint for user registration
    
    This view handles user creation without requiring authentication,
    allowing new users to register with the application.
    """
    queryset = MyUser.objects.all
    serializer_class = UserRegisterSerializer
    permission_classes = [AllowAny]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_profile_data(request, pk):
    """
    Retrieves a user's profile data by username
    
    Args:
        request: The HTTP request
        pk: The username to retrieve profile for
        
    Returns:
        User profile data or appropriate error response
    """
    try:
        try:
            user = MyUser.objects.get(username=pk)
        except MyUser.DoesNotExist:
            return Response({'error':'user does not exist'}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = MyUserProfileSerializer(user, many=False, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        return Response({'error':str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def search_users(request):
    """
    Search for users by username, first name, or last name
    
    Uses a case-insensitive search against multiple user fields
    to provide flexible user searching capabilities.
    """
    try:
        query = request.query_params.get('query', '')
        if not query:
            return Response([])
        
        users = MyUser.objects.filter(
            Q(username__icontains=query) | 
            Q(first_name__icontains=query) | 
            Q(last_name__icontains=query)
        ).exclude(username=request.user.username)[:10]  # Limit to 10 results
        
        serializer = MyUserProfileSerializer(users, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_feed(request):
    try:
        # Get posts from users the current user follows and their own posts
        following = request.user.following.all()
        posts = Post.objects.filter(user__in=following) | Post.objects.filter(user=request.user)
        posts = posts.order_by('-created_at')
        
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_post(request):
    try:
        serializer = PostCreateSerializer(data=request.data)
        if serializer.is_valid():
            post = serializer.save(user=request.user)
            return Response(PostSerializer(post, context={'request': request}).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def get_user_posts(request, username):
    try:
        user = get_object_or_404(MyUser, username=username)
        posts = Post.objects.filter(user=user).order_by('-created_at')
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def like_post(request, post_id):
    try:
        post = get_object_or_404(Post, id=post_id)
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        
        if not created:
            # User already liked this post, so unlike it
            like.delete()
            return Response({'status': 'unliked'}, status=status.HTTP_200_OK)
        
        return Response({'status': 'liked'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_comment(request, post_id):
    try:
        post = get_object_or_404(Post, id=post_id)
        text = request.data.get('text', '').strip()
        
        if not text:
            return Response({'error': 'Comment text cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)
        
        comment = Comment.objects.create(user=request.user, post=post, text=text)
        serializer = CommentSerializer(comment)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def follow_user(request, username):
    try:
        user_to_follow = get_object_or_404(MyUser, username=username)
        
        if request.user == user_to_follow:
            return Response({'error': 'You cannot follow yourself'}, status=status.HTTP_400_BAD_REQUEST)
        
        if request.user in user_to_follow.followers.all():
            # Unfollow
            user_to_follow.followers.remove(request.user)
            return Response({'status': 'unfollowed'}, status=status.HTTP_200_OK)
        else:
            # Follow
            user_to_follow.followers.add(request.user)
            return Response({'status': 'followed'}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def explore(request):
    """Get posts for explore page (all recent posts)"""
    try:
        posts = Post.objects.all().order_by('-created_at')[:20]  # Limit to 20 recent posts
        serializer = PostSerializer(posts, many=True, context={'request': request})
        return Response(serializer.data)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    