from rest_framework import serializers
from .models import MyUser

class MyUserProfileSerializer(serializers.ModelSerializer):

    follower_count = serializers.SerializerMethodField()
    following_count = serializers.SerializerMethodField()

    class Meta:
        model = MyUser
        fields = ['username', 'bio', 'follower_count', 'following_count']
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = MyUser.objects.create_user(**validated_data)
        return user

    def get_follower_count(self, obj):
        return obj.followers.count()
    
    def get_following_count(self, obj):
        return obj.following.count()

class UserRegisterSerializer(serializers.ModelSerializer):

    class Meta:
        model = MyUser
        fields = ['username', 'first_name', 'last_name', 'password']
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        print(validated_data)
        user = MyUser.objects.create_user(**validated_data)
        return user
