from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone

"""
Models for the Social Cooking App

This module defines the database schema for the cooking social network application.
It includes users, posts, likes, and comments with their relationships.
"""

class MyUser(AbstractUser):
    """
    Custom user model extending Django's AbstractUser
    
    Adds social networking features such as bio, profile image, and follower relationships.
    Uses username as the primary key for simplicity and performance.
    """
    username = models.CharField(max_length=50, unique=True, primary_key=True)
    bio = models.CharField(max_length=500, blank=True)
    profile_image = models.ImageField(upload_to='profile_images/', blank=True, null=True)
    followers = models.ManyToManyField('self', symmetrical=False, related_name='following', blank=True)

    # Custom related_names to avoid conflicts with AbstractUser
    groups = models.ManyToManyField(
        'auth.Group',
        related_name='myuser_groups',  # Avoids conflict with auth.User.groups
        blank=True
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='myuser_permissions',  # Avoids conflict with auth.User.user_permissions
        blank=True
    )

    def __str__(self):
        return self.username

class Post(models.Model):
    """
    Recipe post model
    
    Represents a cooking recipe post with an image, caption (recipe description),
    and creation timestamp. Connected to the user who created it.
    """
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE, related_name='posts')
    image = models.ImageField(upload_to='post_images/')
    caption = models.TextField(blank=True)
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['-created_at']  # Show newest posts first
        
    def __str__(self):
        return f"Post by {self.user.username} at {self.created_at}"
    
    @property
    def likes_count(self):
        """Returns the total number of likes on this post"""
        return self.likes.count()
    
    @property
    def comments_count(self):
        """Returns the total number of comments on this post"""
        return self.comments.count()

class Like(models.Model):
    """
    Like model
    
    Represents a user liking a post. The unique_together constraint
    ensures a user can only like a post once.
    """
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ('user', 'post')
        
    def __str__(self):
        return f"{self.user.username} likes {self.post}"

class Comment(models.Model):
    user = models.ForeignKey(MyUser, on_delete=models.CASCADE)
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
    text = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)
    
    class Meta:
        ordering = ['created_at']
        
    def __str__(self):
        return f"Comment by {self.user.username} on {self.post}"