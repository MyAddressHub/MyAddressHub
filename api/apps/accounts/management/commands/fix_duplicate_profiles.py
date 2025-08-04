from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from apps.accounts.models import Profile


class Command(BaseCommand):
    help = 'Fix duplicate profiles by keeping only the first one for each user'

    def handle(self, *args, **options):
        # Find users with duplicate profiles
        users_with_duplicates = []
        
        for user in User.objects.all():
            profiles = Profile.objects.filter(user=user)
            if profiles.count() > 1:
                users_with_duplicates.append(user)
                self.stdout.write(f"User {user.username} has {profiles.count()} profiles")
        
        if not users_with_duplicates:
            self.stdout.write(self.style.SUCCESS("No duplicate profiles found!"))
            return
        
        # Fix duplicate profiles
        for user in users_with_duplicates:
            profiles = Profile.objects.filter(user=user).order_by('created_at')
            
            # Keep the first profile, delete the rest
            first_profile = profiles.first()
            duplicate_profiles = profiles.exclude(id=first_profile.id)
            
            deleted_count = duplicate_profiles.count()
            duplicate_profiles.delete()
            
            self.stdout.write(
                self.style.SUCCESS(
                    f"Fixed user {user.username}: kept 1 profile, deleted {deleted_count} duplicates"
                )
            )
        
        self.stdout.write(
            self.style.SUCCESS(f"Successfully fixed {len(users_with_duplicates)} users with duplicate profiles")
        ) 