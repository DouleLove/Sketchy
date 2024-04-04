import os

from flask import render_template, url_for

from . import app
from .settings import MEDIA_PATH


@app.route('/')
def index():
    previews = [
        url_for('static', filename=f'img/{filename}')
        for filename in os.listdir(MEDIA_PATH) if filename.startswith('preview-sketch')
    ]  # gets previews filenames and then convert them to relative path (from static)

    return render_template('index.html', previews=previews)
