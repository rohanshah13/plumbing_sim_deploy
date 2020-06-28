from django.shortcuts import render
from django.views.generic import View
from django.http import HttpResponse
from django.conf import settings
import os
import csv
from sim.models import Game
from postgres_copy import CopyManager
# Create your views here.

class ReactAppView(View):
	def get(self,request):
		try:
			with open(os.path.join(settings.REACT_APP, 'builda', 'index.html')) as file:
				return HttpResponse(file.read())
		except:
			return HttpResponse(
				'''
				index.html not found ! build your React app !!
				''',
				status = 501,
			)

def index(request, id):
	# Create the HttpResponse object with the appropriate CSV header.
	file_path = './data_' + id + '.csv'
	Log.objects.filter(sim_id=id).to_csv(file_path)
	if os.path.exists(file_path):
		with open(file_path, 'rb') as fh:
			response = HttpResponse(fh.read(), content_type='text/csv')
			response['Content-Disposition'] = 'inline; filename=' + os.path.basename(file_path)
			return response
	raise Http404("Log does not exist")