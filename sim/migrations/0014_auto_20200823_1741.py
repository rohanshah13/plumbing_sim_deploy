# Generated by Django 3.0.6 on 2020-08-23 12:11

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('sim', '0013_chat'),
    ]

    operations = [
        migrations.RenameField(
            model_name='chat',
            old_name='sim',
            new_name='sim_id',
        ),
    ]
