from django.urls import path
from . import views
from django.conf.urls import url
from users.views import DependantListAPIView


urlpatterns = [
    path('prescriptions/', views.ForwardPrescriptionListAPIView.as_view(),
         name=views.ForwardPrescriptionListAPIView.name),
    path('prescriptions/<uuid:pk>/', views.ForwardPrescriptionDetailAPIView.as_view(),
         name=views.ForwardPrescriptionDetailAPIView.name),


    path('prescriptions/<uuid:pk>/quote', views.PrescriptionQuoteCreate.as_view(),
         name=views.PrescriptionQuoteCreate.name),
    path('prescription-quotes/<uuid:pk>/', views.PrescriptionQuoteDetailAPIView.as_view(),
         name=views.PrescriptionQuoteDetailAPIView.name),
    path('prescription-quotes/', views.PrescriptionQuoteListAPIView.as_view(),
         name=views.PrescriptionQuoteListAPIView.name),

    path('prescription-quotes/<uuid:pk>/item', views.QuoteItemCreate.as_view(),
         name=views.QuoteItemCreate.name),
    path('prescription-quote-item/<uuid:pk>', views.QuoteItemDetailAPIView.as_view(),
         name=views.QuoteItemDetailAPIView.name),

    path('prescription-quote-items/', views.QuoteItemListAPIView.as_view(),
         name=views.QuoteItemListAPIView.name),


]
