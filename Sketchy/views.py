__all__ = ()

import os
import uuid

from flask import Blueprint, redirect, render_template, url_for, request, abort, jsonify
from flask_login import LoginManager, login_user, current_user, logout_user

from database._models import User, Sketch
from database._session import Session
from forms import LoginForm
from settings import TEMPLATES_PATH, MEDIA_PATH, ALLOWED_MEDIA_EXTENSIONS, UPLOAD_PATH

blueprint = Blueprint(
    name='views',
    import_name=__name__,
    template_folder=TEMPLATES_PATH
)
login_manager = LoginManager()

session = Session()


@login_manager.user_loader
def load_user(uid):
    return session.query(User).get(uid)


@blueprint.route('/')
def index():
    previews = [
        url_for('static', filename=f'img/{filename}')
        for filename in os.listdir(MEDIA_PATH) if filename.startswith('preview-sketch')
    ]  # gets previews filenames and then convert them to relative path (from static)

    return render_template('index.html', previews=previews)


@blueprint.route('/sketch')
def sketch():
    # sketch_id = request.args.get('sid')
    # if sketch_id is None:
    #     # sketch_id = randint(1, 12)  # fetch random sketch_id from db here

    return render_template('base.html')  # render template here


@blueprint.route('/auth', methods=['GET', 'POST'])
def auth():
    if current_user.is_authenticated:
        return redirect('/profile')

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
    login_user(user, remember=True)

    return redirect(request.args.get('referrer', '/profile'))


@blueprint.route('/logout')
def logout():
    logout_user()  # this will ignore non-authenticated users
    return redirect('/')


@blueprint.route('/profile', methods=['GET', 'POST'])
def profile():
    if request.args.get('uid', current_user.is_authenticated) is False:
        return redirect('/auth')  # non-authenticated user tries to check their account, redirect to auth

    # tries to get uid from request args. Loads current user if uid is not specified
    # (getattr will never return default, it just prevents raising AttributeError for
    # cases where uid is specified but user is not logged in)
    user = load_user(request.args.get('uid', getattr(current_user, 'id', -1)))
    if user is None:
        abort(404)  # request provided invalid uid

    if request.method == 'GET':
        return render_template('profile.html', user=user)

    errors = {}
    params = request.form  # making mutable
    attachments = dict((field.split('-')[0], files) for field, files in request.files.items())

    for param, value in params.items():
        if param == 'username':
            if not value:
                errors[param] = 'Отображаемое имя не указано'
                continue
            user.username = value
        if param == 'description':
            user.description = value
        if param == 'image':
            if (attachment := attachments.get(param)) is None:
                errors[param] = 'Изображение не выбрано'
                continue
            tp = attachment.content_type.split('/')[-1]
            if tp.upper() not in ALLOWED_MEDIA_EXTENSIONS:
                errors[param] = 'Неподдерживаемый тип файла'
                continue
            # remove previous image if exists and not default
            default = str(User.image.default)
            default = default[default.index("'") + 1:default.replace("'", '', 1).index("'") + 1]
            if os.path.isfile(os.path.join(UPLOAD_PATH, user.image)) and user.image != default:
                os.remove(os.path.join(UPLOAD_PATH, user.image))
            # generate unique filename
            while (image_name := f'{uuid.uuid4()}.{tp.lower()}') in os.listdir(UPLOAD_PATH):
                pass
            user.image = image_name
            attachment.save(os.path.join(UPLOAD_PATH, user.image))  # save filename to uploads folder
        if param == 'followers':
            if value == 'false' and current_user not in user.followers:
                user.followers.append(current_user)
            elif value == 'true' and current_user in user.followers:
                user.followers.remove(current_user)
            else:
                errors[param] = 'Ошибка синхронизации. Попробуйте перезагрузить страницу'

    if errors:
        return jsonify(status=400, errors=errors, rendered='')

    session.commit()
    return jsonify(status=200, data={'avatar': user.image})


# session = Session()
# user = User()
# user.login = 'Alex'
# user.password = 'porn'
# sketch = Sketch()
# sketch.name = 'painting'
# sketch.place = 'Moscow'
# user.sketches = [sketch]
# session.add(user)
# session.commit()
# bruh tests

def coincidence(s1, s2):
    if len(s1) > len(s2):
        s1, s2 = s2, s1
    p = 0
    for i in range(len(s1)):
        if s1[i] == s2[i]:
            p += 1
    return int(p / len(s1) * 100)


def render_sketches(benchmark, rule):
    all_sketches = Session().query(Sketch).all()
    all_out = ''
    for sketch in all_sketches:
        sketch_benchmark = eval(f'sketch.{benchmark}')
        if coincidence(sketch_benchmark, rule) >= 70:
            all_out += sketch_benchmark
            # all_out += render_template('sketch.html', sketch=sketch)
    return str(all_out)

