import os

from asgiref.wsgi import WsgiToAsgi

from app.main import app as asgi_app

application = WsgiToAsgi(asgi_app)
