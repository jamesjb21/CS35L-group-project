from django.urls import path
from api.views import (
    CreateUserView,
    get_user_profile_data,
    get_feed,
    create_post,
    get_user_posts,
    like_post,
    add_comment,
    follow_user,
    explore,
    search_users,
    get_user_followers,
    search_recipes,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    # User authentication
    path("user/signup/", CreateUserView.as_view(), name="signup"),
    path("token/", TokenObtainPairView.as_view(), name="get_token"),
    path("token/refresh/", TokenRefreshView.as_view(), name="refresh"),
    
    # User profiles
    path('user_data/<str:pk>/', get_user_profile_data, name="user_profile"),
    path('user/<str:username>/follow/', follow_user, name="follow_user"),
    path('user/<str:username>/followers/', get_user_followers, name="user_followers"),
    path('user/<str:username>/posts/', get_user_posts, name="user_posts"),
    path('users/search/', search_users, name="search_users"),
    
    # Posts and feed
    path('feed/', get_feed, name="feed"),
    path('explore/', explore, name="explore"),
    path('posts/create/', create_post, name="create_post"),
    path('recipes/search/', search_recipes, name="search_recipes"),
    
    # Post interactions
    path('posts/<int:post_id>/like/', like_post, name="like_post"),
    path('posts/<int:post_id>/comment/', add_comment, name="add_comment"),
]
