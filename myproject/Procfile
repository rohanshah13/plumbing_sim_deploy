release: python3 manage.py migrate
web:  daphne myproject.asgi:channel_layer --port $PORT --bind 0.0.0.0 -v2
