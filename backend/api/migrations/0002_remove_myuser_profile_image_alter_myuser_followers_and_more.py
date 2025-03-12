# Generated by Django 5.1.7 on 2025-03-12 11:20

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='myuser',
            name='profile_image',
        ),
        migrations.AlterField(
            model_name='myuser',
            name='followers',
            field=models.ManyToManyField(blank=True, related_name='following', to='api.myuser'),
        ),
        migrations.AlterField(
            model_name='myuser',
            name='groups',
            field=models.ManyToManyField(blank=True, related_name='myuser_groups', to='auth.group'),
        ),
        migrations.AlterField(
            model_name='myuser',
            name='user_permissions',
            field=models.ManyToManyField(blank=True, related_name='myuser_permissions', to='auth.permission'),
        ),
    ]
