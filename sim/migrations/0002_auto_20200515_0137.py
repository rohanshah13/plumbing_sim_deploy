# Generated by Django 3.0.6 on 2020-05-15 01:37

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('sim', '0001_initial'),
    ]

    operations = [
        migrations.RenameField(
            model_name='game',
            old_name='game',
            new_name='grid',
        ),
        migrations.AddField(
            model_name='game',
            name='col',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='game',
            name='row',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='game',
            name='size',
            field=models.IntegerField(default=10),
        ),
    ]
