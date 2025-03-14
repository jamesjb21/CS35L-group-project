from rest_framework import serializers
from .models import MyUser, Post, Like, Comment

class MyUserProfileSerializer(serializers.ModelSerializer):

    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()
    posts_count = serializers.SerializerMethodField()
    profile_image = serializers.SerializerMethodField()
    is_following = serializers.SerializerMethodField()

    class Meta:
        model = MyUser
        fields = ['username', 'bio', 'profile_image', 'follower_count', 'following_count', 'posts_count', 'is_following']
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = MyUser.objects.create_user(**validated_data)
        return user

    def get_follower_count(self, obj):
        return obj.followers.count()
    
    def get_following_count(self, obj):
        return obj.following.count()
    
    def get_posts_count(self, obj):
        return obj.posts.count()
        
    def get_profile_image(self, obj):
        if obj.profile_image and hasattr(obj.profile_image, 'url'):
            return obj.profile_image.url
        return None
        
    def get_is_following(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return request.user in obj.followers.all()
        return False

class UserRegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = MyUser
        fields = ['username', 'first_name', 'last_name', 'password', 'email']
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = MyUser.objects.create_user(**validated_data)
        return user

class CommentSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Comment
        fields = ['id', 'username', 'text', 'created_at']
        read_only_fields = ['id', 'username', 'created_at']

class LikeSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    
    class Meta:
        model = Like
        fields = ['id', 'username', 'created_at']
        read_only_fields = ['id', 'username', 'created_at']

class PostSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')
    likes_count = serializers.ReadOnlyField()
    comments_count = serializers.ReadOnlyField()
    comments = CommentSerializer(many=True, read_only=True)
    liked_by_user = serializers.SerializerMethodField()
    
    class Meta:
        model = Post
        fields = ['id', 'username', 'image', 'caption', 'created_at', 
                 'likes_count', 'comments_count', 'comments', 'liked_by_user']
        read_only_fields = ['id', 'username', 'created_at', 'likes_count', 
                           'comments_count', 'liked_by_user']
    
    def get_liked_by_user(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return Like.objects.filter(user=request.user, post=obj).exists()
        return False

class PostCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = ['image', 'caption']
