from django.conf.urls import url,path

from . import views

app_name = 'sim'
urlpatterns = [
	path('log/', views.index, name='index'),
	url(r'^', views.ReactAppView.as_view()),
]
