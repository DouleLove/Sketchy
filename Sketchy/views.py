__all__ = ()

import os

from flask import Blueprint, redirect, render_template, url_for, request
from flask_login import LoginManager, login_user

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
def sketch_view():
    # sketch_id = request.args.get('sid')
    # if sketch_id is None:
    #     # sketch_id = randint(1, 12)  # fetch random sketch_id from db here

    return render_template('base.html')  # render template here


@blueprint.route('/auth', methods=['GET', 'POST'])
def auth():
    form = LoginForm(new=bool(request.args.get('n')))

    if (user := form.validate_on_submit()) is False:  # validation failed or form just created
        return render_template('signin-form.html' if request.args.get('n') is None else 'signup-form.html', form=form)

    if user is None:
        # create new user
        session = Session()
        user = User()
        user.login = form.login.data
        user.password = form.password.data
        session.add(user)
        session.commit()
    login_user(user)

    return redirect(request.args.get('referrer', '/profile'))


@blueprint.route('/profile')
def profile():
    # uid = request.args.get('uid', current_user.id)

    return render_template('base.html')
