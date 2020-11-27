import base64

from django.contrib.auth import authenticate, get_user_model
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db.models import Q
from django.shortcuts import get_object_or_404, redirect, render
from django.utils.encoding import force_bytes, force_text
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from rest_framework import generics, permissions, status, exceptions
from rest_framework.exceptions import NotAcceptable, NotFound, ValidationError
from rest_framework.response import Response
from rest_framework_jwt.authentication import JSONWebTokenAuthentication
from rest_framework_jwt.settings import api_settings
from . import serializers
from . import models

from .token_generator import account_activation_token
from .utils import jwt_response_payload_handler
from core.permissions import IsOwner, ClientPermission, PrescriberPermission, IsSubscribedPermission
from core.views import FacilitySafeViewMixin
jwt_payload_handler = api_settings.JWT_PAYLOAD_HANDLER
jwt_encode_handler = api_settings.JWT_ENCODE_HANDLER
jwt_response_payload_handler = api_settings.JWT_RESPONSE_PAYLOAD_HANDLER
User = get_user_model()


class MerchantCreate(generics.CreateAPIView):
    """
    Create new merchant account
    ===========================
    Any user
    """
    name = 'merchant-create'
    permission_classes = (
        permissions.AllowAny,
    )
    serializer_class = serializers.MerchantSerializer


# class FacilityList(generics.ListAPIView):
#     """List of all porfolios"""
#     name = 'portfolio-list'
#     permission_classes = (
#         permissions.IsAuthenticated,
#     )
#     serializer_class = serializers.FacilitySerializer
#     queryset = models.Facility.objects.all()

#     def get_queryset(self):
#         # Ensure that the users belong to the portfolio of the user that is making the request
#         owner_national_id = self.request.user.national_id
#         return super().get_queryset().filter(owner_national_id=owner_national_id)


class FacilityDetail(generics.RetrieveAPIView):
    """
    Logged in user
    ================================================
    1. View details of own facility
    """
    name = 'facility-detail'
    permission_classes = (
        permissions.IsAuthenticated,
    )
    serializer_class = serializers.FacilitySerializer
    queryset = models.Facility.objects.all()

    def get_object(self):
        # Ensure that users can only see the company that they belong to
        return self.request.user.facility


class AnyUserRegisterAPIView(generics.CreateAPIView):
    """Allow any user to register in the system"""
    name = 'user-register'
    permission_classes = ()
    authentication_classes = ()

    serializer_class = serializers.UserSerializer
    queryset = User.objects.all()

    def perform_create(self, serializer):
        serializer.save()

    def create(self, request, *args, **kwargs):
        errors_messages = []
        if(User.objects.filter(email=request.data['email']).exists()):

            raise exceptions.ValidationError(
                {"message": ["The email provided is already in use", ]})

        if(User.objects.filter(national_id=request.data['national_id']).exists()):

            raise exceptions.ValidationError({"message": [
                "The national ID number provided is already in use", ]})

        if(User.objects.filter(phone=request.data['phone']).exists()):
            raise exceptions.ValidationError({"message": [
                "The phone number provided is already in use", ]})

        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():

            self.perform_create(serializer)
            return Response(data={"message": "User created successfully.Please login to your email to verify activate your account.", "user": serializer.data, "status": status.HTTP_201_CREATED, "errors": errors_messages}, status=status.HTTP_201_CREATED)
        else:

            raise exceptions.ValidationError(
                {"data": ["The seems to be an error with your provide data!", ]})
        default_errors = serializer.errors  # default errors dict
        errors_messages = []
        for field_name, field_errors in default_errors.items():
            for field_error in field_errors:
                error_message = '%s: %s' % (field_name, field_error)
                errors_messages.append(error_message)

        return Response(data={"message": "User not created", "user": serializer.data, "status": status.HTTP_400_BAD_REQUEST, "errors": errors_messages}, status=status.HTTP_201_CREATED)


class UserList(FacilitySafeViewMixin, generics.ListCreateAPIView):
    name = 'user-list'
    permission_classes = (
        permissions.IsAdminUser,
    )
    serializer_class = serializers.UserSerializer
    queryset = User.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        print(request.data['email'])
        if serializer.is_valid():
            errors_messages = []
            self.perform_create(serializer)
            qs = User.objects.filter(
                Q(email__iexact=request.data['email'])
            ).distinct()
            if qs.count() == 1:
                user_obj = qs.first()
                print("user_obj")
                print(user_obj)
                if user_obj.check_password(request.data['password']):
                    user = user_obj
                    payload = jwt_payload_handler(user)
                    token = jwt_encode_handler(payload)
                    response = jwt_response_payload_handler(
                        token, user, request=request)
                    return Response(response)
            return Response(data={"message": "User created successfully.", "user": response, "status": status.HTTP_201_CREATED, "errors": errors_messages}, status=status.HTTP_201_CREATED)
        else:
            default_errors = serializer.errors  # default errors dict
            errors_messages = []
            for field_name, field_errors in default_errors.items():
                for field_error in field_errors:
                    error_message = '%s: %s' % (field_name, field_error)
                    errors_messages.append(error_message)

            return Response(data={"message": "User not created", "user": serializer.data, "status": status.HTTP_400_BAD_REQUEST, "errors": errors_messages}, status=status.HTTP_201_CREATED)

    def get_queryset(self, *args, **kwargs):
        facility_id = self.request.user.facility_id
        qs = super(UserList, self).get_queryset(*args, **kwargs)
        query = self.request.GET.get("q")
        if query:
            qs = self.queryset.filter(
                Q(email__icontains=query) |
                Q(username__icontains=query) |
                Q(national_id__icontains=query)
            )

        return qs.filter(facility_id=facility_id)


class UserDetail(FacilitySafeViewMixin, generics.RetrieveUpdateDestroyAPIView):
    name = 'user-detail'
    permission_classes = (
        permissions.IsAuthenticated,
    )
    serializer_class = serializers.UserSerializer
    queryset = User.objects.all()

    def get_queryset(self):
        # Ensure that the user belongs to the company of the user that is making the request
        # Note that this method is identical to the one in `UserList`
        facility_id = self.request.user.facility_id
        return super().get_queryset().filter(facility_id=facility_id)


def activate_account(request, uidb64, token):
    """Confirm email account, if succesful user is redirected to login"""
    try:
        uid = base64.b64decode(uidb64).decode('utf-8')
        user = User.objects.get(pk=uid)
        print(user)
    except(TypeError, ValueError, OverflowError, User.DoesNotExist):
        user = None
    if user is not None and account_activation_token.check_token(user, token):
        user.is_active = True
        user.save()
        return redirect("/")
    else:
        return HttpResponse('Activation link is invalid!')


class UserLoginView(generics.views.APIView):
    """Log in a user using JWT"""

    permission_classes = (permissions.AllowAny,)
    authentication_classes = ()
    serializer_class = serializers.UserLoginSerializer

    def get_queryset(self):
        user = self.request.user
        return user.customer.all()
    # queryset = User.objects.all()

    def post(self, request):
        data = request.data
        username = data.get('email')
        password = data.get('password')
        user = authenticate(username=username, password=password)
        # print(user)
        qs = User.objects.filter(
            Q(email__iexact=username)
        ).distinct()
        if qs.count() == 1:
            user_obj = qs.first()
            print("user_obj")
            print(user_obj)
            if user_obj.check_password(password):
                user = user_obj
                payload = jwt_payload_handler(user)
                token = jwt_encode_handler(payload)
                response = jwt_response_payload_handler(
                    token, user, request=request)
                return Response(response)
            else:
                raise exceptions.AuthenticationFailed('Wrong password')
        else:
            raise exceptions.AuthenticationFailed('User not found')
        return Response({'status': 401, 'detail': 'Invalid credentials'})


class UserImageAPIView(generics.CreateAPIView):
    name = 'userimage'
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = serializers.UserImageSerializer
    queryset = models.UserImage.objects.all()
    lookup_fields = ('pk',)

    def perform_create(self, serializer):

        user = self.request.user

        serializer.save(created_by=user
                        )

    def get_object(self):
        queryset = self.get_queryset()
        filter = {}
        for field in self.lookup_fields:
            filter[field] = self.kwargs[field]

        obj = get_object_or_404(queryset, **filter)
        self.check_object_permissions(self.request, obj)
        return obj


class UserImageDetail(generics.RetrieveUpdateDestroyAPIView):
    name = 'userimage-detail'
    permission_classes = (
        permissions.IsAuthenticated,
    )
    serializer_class = serializers.UserImageSerializer
    queryset = models.UserImage.objects.all()

    def get_queryset(self):
        portfolio_id = self.request.user.portfolio_id
        return super().get_queryset().filter(portfolio_id=portfolio_id)

    def delete(self, request, pk=None, **kwargs):

        print("No deletes")
# Get User API


class UserAPI(generics.RetrieveAPIView):
    """
    Get user
    """
    name = 'user-retrieve'
    permission_classes = [
        permissions.IsAuthenticated
    ]
    serializer_class = serializers.UserSerializer

    def get_object(self):
        try:
            return self.request.user
        except:
            raise exceptions.PermissionDenied(
                {"login": ["Please login again!", ]})

# Account


class AccountCreateAPIView(generics.CreateAPIView):
    """
    Create new account
    """
    name = "account-create"
    permission_classes = (permissions.IsAuthenticated,
                          )
    serializer_class = serializers.AccountSerializer
    queryset = models.Account.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        if models.Account.objects.filter(owner=user).count() > 0:
            raise exceptions.NotAcceptable(
                {"detail": ["You are already registered an account!", ]})
        else:
            pass

        if user.is_client:
            user.is_prescriber = True
            user.save()
            serializer.save(owner=user)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            errors_messages = []
            self.perform_create(serializer)
            return Response(data={"message": "Account created successfully.", "prescriber": serializer.data,  "errors": errors_messages}, status=status.HTTP_201_CREATED)
        else:
            default_errors = serializer.errors  # default errors dict
            errors_messages = []
            for field_name, field_errors in default_errors.items():
                for field_error in field_errors:
                    error_message = '%s: %s' % (field_name, field_error)
                    errors_messages.append(error_message)

            return Response(data={"message": "Account not created", "prescriber": serializer.data,  "errors": errors_messages}, status=status.HTTP_201_CREATED)


class AccountListAPIView(generics.ListAPIView):
    """
    Listing of all or permitted client accounts
    """
    name = "account-list"
    permission_classes = (permissions.AllowAny,
                          )
    serializer_class = serializers.AccountSerializer

    queryset = models.Account.objects.all()
    # TODO : Reuse this for filtering by q.

    def get_context_data(self, *args, **kwargs):
        context = super(AccountListAPIView, self).get_context_data(
            *args, **kwargs)
        # context["now"] = timezone.now()
        context["query"] = self.request.GET.get("q")  # None
        return context

    def get_queryset(self, *args, **kwargs):
        qs = super(AccountListAPIView, self).get_queryset(*args, **kwargs)
        query = self.request.GET.get("q")
        if query:
            qs = super().get_queryset().filter(  # Change this to ensure it searches only already filtered queryset
                Q(title__icontains=query) |
                Q(description__icontains=query)
            )

        return qs


class AccountDetailAPIView(generics.RetrieveAPIView):
    name = 'account-detail'
    permission_classes = (
        permissions.IsAuthenticated,
    )
    serializer_class = serializers.AccountSerializer
    queryset = models.Account.objects.all()

    def get_queryset(self):
        user = self.request.user
        return super().get_queryset().filter(owner=user)


class AccountUpdateAPIView(generics.RetrieveUpdateAPIView):
    """
    Account update
    """
    name = "account-update"
    permission_classes = (permissions.IsAdminUser,
                          )
    serializer_class = serializers.AccountSerializer
    queryset = models.Account.objects.all()
    lookup_fields = ('pk',)

    def get_object(self):
        queryset = self.get_queryset()
        filter = {}
        for field in self.lookup_fields:
            filter[field] = self.kwargs[field]

        obj = get_object_or_404(queryset, **filter)
        self.check_object_permissions(self.request, obj)
        return obj


# # Dependants
class DependantCreateAPIView(generics.CreateAPIView):
    """
    Create new dependant
    """
    name = "dependant-create"
    permission_classes = (permissions.IsAuthenticated,
                          )
    serializer_class = serializers.DependantSerializer
    queryset = models.Dependant.objects.all()

    def perform_create(self, serializer):
        user = self.request.user
        account_pk = self.kwargs.get("pk")
        account = models.Account.objects.get(id=account_pk)
        if account:
            serializer.save(owner=user, account=account)
        else:
            raise exceptions.ValidationError(
                {"detail": ["No such account in the system", ]})

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            errors_messages = []
            self.perform_create(serializer)
            return Response(data={"message": "Dependant created successfully.", "dependant": serializer.data,  "errors": errors_messages}, status=status.HTTP_201_CREATED)
        else:
            default_errors = serializer.errors  # default errors dict
            errors_messages = []
            for field_name, field_errors in default_errors.items():
                for field_error in field_errors:
                    error_message = '%s: %s' % (field_name, field_error)
                    errors_messages.append(error_message)

            return Response(data={"message": "Dependant not created", "dependant": serializer.data,  "errors": errors_messages}, status=status.HTTP_201_CREATED)


class DependantListAPIView(generics.ListAPIView):
    """
    Dependants list
    """
    name = "dependant-list"
    permission_classes = (permissions.IsAuthenticated,
                          )
    serializer_class = serializers.DependantSerializer

    queryset = models.Dependant.objects.all()
    # TODO : Reuse this for filtering by q.

    def get_context_data(self, *args, **kwargs):
        context = super(DependantListAPIView, self).get_context_data(
            *args, **kwargs)
        # context["now"] = timezone.now()
        context["query"] = self.request.GET.get("q")  # None
        return context

    def get_queryset(self, *args, **kwargs):
        user = self.request.user
        qs = super(DependantListAPIView, self).get_queryset(*args, **kwargs)
        query = self.request.GET.get("q")
        if query:
            qs = super().get_queryset().filter(  # Change this to ensure it searches only already filtered queryset
                Q(title__icontains=query) |
                Q(description__icontains=query)
            )

        return qs.filter(owner=user)


class DependantDetailAPIView(generics.RetrieveAPIView):
    """
    Dependant details
    """
    name = "dependant-detail"
    permission_classes = (permissions.AllowAny,
                          )
    serializer_class = serializers.DependantSerializer
    queryset = models.Dependant.objects.all()
    lookup_fields = ('pk',)

    def get_object(self):
        queryset = self.get_queryset()
        filter = {}
        for field in self.lookup_fields:
            filter[field] = self.kwargs[field]

        obj = get_object_or_404(queryset, **filter)
        self.check_object_permissions(self.request, obj)
        return obj


class DependantUpdateAPIView(generics.RetrieveUpdateAPIView):
    """
    Dependant update
    """
    name = "dependant-update"
    permission_classes = (IsOwner,
                          )
    serializer_class = serializers.DependantSerializer
    queryset = models.Dependant.objects.all()
    lookup_fields = ('pk',)

    def get_object(self):
        queryset = self.get_queryset()
        filter = {}
        for field in self.lookup_fields:
            filter[field] = self.kwargs[field]

        obj = get_object_or_404(queryset, **filter)
        self.check_object_permissions(self.request, obj)
        return obj

# # Allergy


class AllergyCreateAPIView(generics.CreateAPIView):
    """
    Post new allergy for dependant
    """
    name = "allergy-create"
    permission_classes = (permissions.IsAuthenticated,
                          )
    serializer_class = serializers.AllergySerializer
    queryset = models.Allergy.objects.all()

    def perform_create(self, serializer):
        dependant_pk = self.kwargs.get("pk")
        dependant = models.Dependant.objects.get(id=dependant_pk)
        user = self.request.user
        if dependant:
            serializer.save(owner=user, dependant=dependant)
        else:
            raise exceptions.ValidationError(
                {"detail": ["No dependant matches the given identifier", ]})

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            errors_messages = []
            self.perform_create(serializer)
            return Response(data={"message": "Allergy created successfully.", "allergy": serializer.data,  "errors": errors_messages}, status=status.HTTP_201_CREATED)
        else:
            default_errors = serializer.errors  # default errors dict
            errors_messages = []
            for field_name, field_errors in default_errors.items():
                for field_error in field_errors:
                    error_message = '%s: %s' % (field_name, field_error)
                    errors_messages.append(error_message)

            return Response(data={"message": "Allergy not created", "allergy": serializer.data,  "errors": errors_messages}, status=status.HTTP_201_CREATED)


class AllergyListAPIView(generics.ListAPIView):
    """
    Allergies list
    """
    name = "allergy-list"
    permission_classes = (permissions.AllowAny,
                          )
    serializer_class = serializers.AllergySerializer

    queryset = models.Allergy.objects.all()
    # TODO : Reuse this for filtering by q.

    def get_context_data(self, *args, **kwargs):
        context = super(AllergyListAPIView, self).get_context_data(
            *args, **kwargs)
        # context["now"] = timezone.now()
        context["query"] = self.request.GET.get("q")  # None
        return context

    def get_queryset(self, *args, **kwargs):
        qs = super(AllergyListAPIView, self).get_queryset(*args, **kwargs)
        query = self.request.GET.get("q")
        if query:
            qs = super().get_queryset().filter(  # Change this to ensure it searches only already filtered queryset
                Q(title__icontains=query) |
                Q(description__icontains=query)
            )

        return qs


class AllergyDetailAPIView(generics.RetrieveAPIView):
    """
    Allergy details
    """
    name = "allergy-detail"
    permission_classes = (permissions.AllowAny,
                          )
    serializer_class = serializers.AllergySerializer
    queryset = models.Allergy.objects.all()
    lookup_fields = ('pk',)

    def get_object(self):
        queryset = self.get_queryset()
        filter = {}
        for field in self.lookup_fields:
            filter[field] = self.kwargs[field]

        obj = get_object_or_404(queryset, **filter)
        self.check_object_permissions(self.request, obj)
        return obj


class AllergyUpdateAPIView(generics.RetrieveUpdateAPIView):
    """
    Allergy update
    """
    name = "allergy-update"
    permission_classes = (permissions.IsAdminUser,
                          )
    serializer_class = serializers.AllergySerializer
    queryset = models.Allergy.objects.all()
    lookup_fields = ('pk',)

    def get_object(self):
        queryset = self.get_queryset()
        filter = {}
        for field in self.lookup_fields:
            filter[field] = self.kwargs[field]

        obj = get_object_or_404(queryset, **filter)
        self.check_object_permissions(self.request, obj)
        return obj
