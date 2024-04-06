__all__ = ()

import os
from random import randint

from flask import Blueprint, redirect, render_template, url_for, request
from flask_login import LoginManager

from database import User, Session
from forms import LoginForm
from settings import TEMPLATES_PATH, MEDIA_PATH

blueprint = Blueprint(
    name='views',
    import_name=__name__,
    template_folder=TEMPLATES_PATH
)
login_manager = LoginManager()


@login_manager.user_loader
def load_user(uid):
    return Session().query(User).get(uid)


@blueprint.route('/')
def index():
    previews = [
        url_for('static', filename=f'img/{filename}')
        for filename in os.listdir(MEDIA_PATH) if filename.startswith('preview-sketch')
    ]  # gets previews filenames and then convert them to relative path (from static)

    return render_template('index.html', previews=previews)


@blueprint.route('/sketch')
@blueprint.route('/sketch/<int:sketch_id>')
def sketch_view(sketch_id=None):
    if not sketch_id:
        sketch_id = randint(1, 12)
        return redirect(f'{request.url}/{sketch_id}')

    return str(sketch_id)  # render template here


@blueprint.route('/auth', methods=['GET', 'POST'])
def auth():
    form = LoginForm()
    return render_template('form.html', form=form)