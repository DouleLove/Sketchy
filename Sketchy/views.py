import os
from random import randint

from flask import Blueprint, redirect, render_template, url_for

# from database import User, Session
from settings import MEDIA_PATH


blueprint = Blueprint(
    'views',
    __name__,
    template_folder='templates'
)

@blueprint.route('/')
def index():
    previews = [
        url_for('static', filename=f'img/{filename}')
        for filename in os.listdir(MEDIA_PATH) if filename.startswith('preview-sketch')
    ]  # gets previews filenames and then convert them to relative path (from static)

    return render_template('index.html', previews=previews)


@blueprint.route('/sketch/')
@blueprint.route('/sketch/<int:sketch_id>')
def sketch_view(sketch_id=None):
    if not sketch_id:
        return redirect(f'{randint(0, 12)}')  # пока так
    else:
        return str(sketch_id)
