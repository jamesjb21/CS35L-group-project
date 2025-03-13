from django.contrib import admin
from .models import MyUser, Post, Like, Comment

admin.site.register(MyUser)
admin.site.register(Post)
admin.site.register(Like)
admin.site.register(Comment)

# Register your models here.
