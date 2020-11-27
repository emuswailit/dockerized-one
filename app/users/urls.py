from django.urls import path
from . import views
from django.conf.urls import url


urlpatterns = [
    path("merchant/", views.MerchantCreate.as_view(),
         name=views.MerchantCreate.name),

    path('register/', views.AnyUserRegisterAPIView.as_view(),
         name=views.AnyUserRegisterAPIView.name),
    path('user/', views.UserAPI.as_view(), name=views.UserAPI.name),
    path('users/', views.UserList.as_view(), name=views.UserList.name),
    path('users/<uuid:pk>', views.UserDetail.as_view(),
         name=views.UserDetail.name),
    path('signin/', views.UserLoginView.as_view(), name="login"),

    path('users/<uuid:pk>/image', views.UserImageAPIView.as_view(),
         name=views.UserImageAPIView.name),
    path('user-image/<uuid:pk>/', views.UserImageDetail.as_view(),
         name=views.UserImageDetail.name),
    path('activate/<slug:uidb64>/<slug:token>/',
         views.activate_account, name='activate'),

    path('facilities/', views.FacilityDetail.as_view(),
         name=views.FacilityDetail.name),
    path('facilities/<uuid:pk>/', views.FacilityDetail.as_view(),
         name=views.FacilityDetail.name),


    #     Dependants urls
    path('dependants', views.DependantListAPIView.as_view(),
         name=views.DependantListAPIView.name),
    path('dependants/<uuid:pk>', views.DependantDetailAPIView.as_view(),
         name=views.DependantDetailAPIView.name),
    path('dependants/<uuid:pk>/update', views.DependantUpdateAPIView.as_view(),
         name=views.DependantUpdateAPIView.name),
    path('accounts/<uuid:pk>/dependant', views.DependantCreateAPIView.as_view(),
         name=views.DependantCreateAPIView.name),

    #     Allergy urls
    path('allergies', views.AllergyListAPIView.as_view(),
         name=views.AllergyListAPIView.name),
    path('allergies/<uuid:pk>', views.AllergyDetailAPIView.as_view(),
         name=views.AllergyDetailAPIView.name),
    path('allergies/<uuid:pk>/update', views.AllergyUpdateAPIView.as_view(),
         name=views.AllergyUpdateAPIView.name),
    path('dependants/<uuid:pk>/allergy', views.AllergyCreateAPIView.as_view(),
         name=views.AllergyCreateAPIView.name),

    path('accounts', views.AccountListAPIView.as_view(),
         name=views.AccountListAPIView.name),

    path('accounts/<uuid:pk>', views.AccountDetailAPIView.as_view(),
         name=views.AccountDetailAPIView.name),

]
