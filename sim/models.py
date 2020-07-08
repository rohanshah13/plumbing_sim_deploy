from django.db import models
from django.contrib.postgres.fields import JSONField
from postgres_copy import CopyManager

# Create your models here.

class Game(models.Model):
	logged_in = models.BooleanField(default=False)
	game_id = models.TextField(max_length=30)
	size = models.IntegerField(default=10)
	height = models.IntegerField(default=22)
	width = models.IntegerField(default=22)
	row = models.IntegerField(default=0)
	col = models.IntegerField(default=0)
	initial_pressure = models.IntegerField(default=60)
	grid = JSONField()
	pressure = JSONField(default=None)
	cost = models.IntegerField(default=0)
	budget = models.IntegerField(default=0)
	objects = CopyManager()

class Log(models.Model):
	sim_id = models.TextField(max_length=30)
	action = models.TextField(max_length=30)
	location =  models.TextField(max_length=10)
	info = JSONField(default=None)
	money_spent = models.IntegerField(default=0)
	money_left = models.IntegerField(default=0)	
	timestamp = models.DateTimeField(auto_now_add=True)
	objects = CopyManager()