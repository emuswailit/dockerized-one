# Generated by Django 3.1.1 on 2020-11-22 02:50

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone
import users.models
import uuid


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
    ]

    operations = [
        migrations.CreateModel(
            name='User',
            fields=[
                ('password', models.CharField(max_length=128, verbose_name='password')),
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('is_staff', models.BooleanField(default=False, help_text='Designates whether the user can log into this admin site.', verbose_name='staff status')),
                ('is_active', models.BooleanField(default=True, help_text='Designates whether this user should be treated as active. Unselect this instead of deleting accounts.', verbose_name='active')),
                ('date_joined', models.DateTimeField(default=django.utils.timezone.now, verbose_name='date joined')),
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('email', models.EmailField(max_length=254, unique=True, verbose_name='email')),
                ('phone', models.CharField(max_length=30, unique=True)),
                ('first_name', models.CharField(max_length=120)),
                ('middle_name', models.CharField(blank=True, default='', max_length=120, null=True)),
                ('last_name', models.CharField(max_length=120)),
                ('national_id', models.CharField(max_length=30, unique=True)),
                ('is_client', models.BooleanField(default=True)),
                ('is_pharmacist', models.BooleanField(default=False)),
                ('is_prescriber', models.BooleanField(default=False)),
                ('is_courier', models.BooleanField(default=False)),
                ('is_superintendent', models.BooleanField(default=False)),
                ('is_administrator', models.BooleanField(default=False)),
                ('gender', models.CharField(choices=[('Female', 'Female'), ('Male', 'Male')], max_length=120)),
                ('role', models.CharField(choices=[('Client', 'Client'), ('Editor', 'Editor')], default='client', max_length=120)),
                ('date_of_birth', models.DateField(null=True)),
                ('created', models.DateField(auto_now_add=True)),
                ('updated', models.DateField(auto_now=True)),
            ],
            options={
                'db_table': 'users',
            },
        ),
        migrations.CreateModel(
            name='Account',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('limit', models.DecimalField(decimal_places=2, default=0.0, max_digits=20)),
                ('current_balance', models.DecimalField(decimal_places=2, default=0.0, max_digits=20)),
                ('created', models.DateField(auto_now_add=True)),
                ('updated', models.DateField(auto_now=True)),
                ('owner', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Facility',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('title', models.CharField(max_length=256)),
                ('facility_type', models.CharField(choices=[('Default', 'Default'), ('Pharmacy', 'Pharmacy'), ('Clinic', 'Clinic')], max_length=50)),
                ('county', models.CharField(choices=[('Busia', 'Busia'), ('Bungoma', 'Bungoma'), ('Mombasa', 'Mombasa'), ('Nairobi', 'Nairobi')], max_length=50)),
                ('town', models.CharField(max_length=256)),
                ('road', models.CharField(max_length=256)),
                ('building', models.CharField(blank=True, max_length=256, null=True)),
                ('latitude', models.DecimalField(blank=True, decimal_places=20, max_digits=20, null=True)),
                ('longitude', models.DecimalField(blank=True, decimal_places=20, max_digits=20, null=True)),
                ('description', models.TextField(blank=True, null=True)),
                ('paid_until', models.DateField(blank=True, null=True)),
                ('is_subscribed', models.BooleanField(default=False)),
                ('is_verified', models.BooleanField(default=False)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('updated', models.DateTimeField(auto_now=True)),
            ],
            options={
                'db_table': 'facilities',
            },
        ),
        migrations.CreateModel(
            name='UserImage',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('image', models.ImageField(upload_to=users.models.image_upload_to)),
                ('created', models.DateField(auto_now_add=True)),
                ('updated', models.DateField(auto_now=True)),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='user_images', to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Dependant',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('first_name', models.CharField(max_length=120)),
                ('middle_name', models.CharField(blank=True, max_length=120, null=True)),
                ('last_name', models.CharField(blank=True, max_length=120, null=True)),
                ('gender', models.CharField(choices=[('Female', 'Female'), ('Male', 'Male')], max_length=120)),
                ('date_of_birth', models.DateField()),
                ('created', models.DateField(auto_now_add=True)),
                ('updated', models.DateField(auto_now=True)),
                ('account', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.account')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Allergy',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('allergy', models.TextField()),
                ('created', models.DateField(auto_now_add=True)),
                ('updated', models.DateField(auto_now=True)),
                ('dependant', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='users.dependant')),
                ('owner', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.AddField(
            model_name='user',
            name='facility',
            field=models.ForeignKey(blank=True, editable=False, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='user', to='users.facility'),
        ),
        migrations.AddField(
            model_name='user',
            name='groups',
            field=models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.Group', verbose_name='groups'),
        ),
        migrations.AddField(
            model_name='user',
            name='user_permissions',
            field=models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.Permission', verbose_name='user permissions'),
        ),
    ]
