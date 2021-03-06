# Generated by Django 3.0.6 on 2020-08-18 18:06

import django.contrib.postgres.fields.jsonb
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sim', '0011_auto_20200708_1214'),
    ]

    operations = [
        migrations.AddField(
            model_name='game',
            name='budget_sub',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='game',
            name='col_sub',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='game',
            name='cost_sub',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='game',
            name='grid_sub',
            field=django.contrib.postgres.fields.jsonb.JSONField(default=None),
        ),
        migrations.AddField(
            model_name='game',
            name='height_sub',
            field=models.IntegerField(default=22),
        ),
        migrations.AddField(
            model_name='game',
            name='initial_pressure_sub',
            field=models.IntegerField(default=60),
        ),
        migrations.AddField(
            model_name='game',
            name='pressure_sub',
            field=django.contrib.postgres.fields.jsonb.JSONField(default=None),
        ),
        migrations.AddField(
            model_name='game',
            name='row_sub',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='game',
            name='width_sub',
            field=models.IntegerField(default=22),
        ),
    ]
