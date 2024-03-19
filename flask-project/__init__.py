__all__ = ()

import os

from flask import Flask

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ['flask-app-secretkey']

from .views import *  # NOQA  # force views to be initialized right after creating app
