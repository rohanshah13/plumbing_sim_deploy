from django.conf.urls import url
from django.urls import path
from . import views

app_name = 'sim'
urlpatterns = [
	path('log/<str:id>', views.index, name='index'),
	url(r'^', views.ReactAppView.as_view()),
]
