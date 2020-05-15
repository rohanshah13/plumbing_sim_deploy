from django.conf.urls import url

from . import views

app_name = 'sim'
urlpatterns = [
	url(r'^', views.ReactAppView.as_view()),
]