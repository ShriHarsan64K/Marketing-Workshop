"""Entry point for gunicorn / PythonAnywhere:  `gunicorn wsgi:app`"""
from app import create_app

app = create_app()
