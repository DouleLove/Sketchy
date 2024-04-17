__all__ = ()

import os
import uuid

from flask import Blueprint, redirect, render_template, url_for, request, abort, jsonify
from flask_login import LoginManager, login_user, current_user, logout_user

from database import User, Session
from forms import LoginForm
from settings import TEMPLATES_PATH, MEDIA_PATH, ALLOWED_MEDIA_EXTENSIONS, UPLOAD_PATH
from utils import lazy_loader, get_session

# from stuff import render_sketches На будущее
blueprint = Blueprint(
    name='views',
    import_name=__name__,
    template_folder=TEMPLATES_PATH
)
login_manager = LoginManager()


@lazy_loader
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

    user = load_user(request.args.get('uid', getattr(current_user, 'id', None)))
    # if not user.sketches:
    #     session = Session()
    #     for i in range(100):
    #         sk = Sketch()
    #         sk.name = f'sketch_{i}'
    #         sk.image = f'../preview-sketch-{i % 3 + 1}.jpg'
    #         sk.place = 'Москва, Красная площадь'
    #         sk.author_id = user.id
    #         session.add(sk)
    #     session.commit()
    if user is None:
        abort(404)  # request provided invalid uid

    if request.method == 'GET':
        is_system_call = request.args.get('limit') is not None and request.args.get('offset') is not None
        limit = request.args.get('limit', 10, type=int)
        offset = request.args.get('offset', 0, type=int)
        view = request.args.get('view', 'sketches')
        if not is_system_call or getattr(user, view, None) is None:
            return render_template('profile.html', user=user)
        results_left = max(len(getattr(user, view)) - offset - limit, 0)
        return jsonify(status=200, data={'results_left': results_left}, rendered='\n'.join(render_template(
            'sketch-preview.html' if view == 'sketches' else 'user-preview.html',
            sketch=item, user=item, author_context=False
        ) for item in getattr(user, view)[offset:offset + limit]))

    errors = {}
    params = request.form
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
            # merge current_user to user's session to not access current_user in different threads
            merged = get_session(user).merge(current_user)
            if value == 'false' and current_user not in user.followers:
                user.followers.append(merged)
            elif value == 'true' and current_user in user.followers:
                user.followers.remove(merged)
            else:
                errors[param] = 'Не удалось синхронизировать данные с сервером'

    if errors:
        return jsonify(status=400, errors=errors, rendered=render_template(
            'response-message.html', status=400, description='\n'.join(errors[error] for error in errors)
        ))

    # creating response json before commit because it will close user's session
    ret = jsonify(
        status=200, user_data={'avatar': user.image}, rendered=render_template(
            'response-message.html', status=200, description='Изменения профиля сохранены'
        )
    )
    get_session(user).commit()
    return ret
