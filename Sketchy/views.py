__all__ = ()

import os
import uuid
from datetime import datetime
from random import randint

from flask import Blueprint, redirect, render_template, url_for, request, abort, jsonify, g
from flask_login import LoginManager, login_user, current_user, logout_user

from database import User, Sketch, Session
from forms import LoginForm, SketchForm
from settings import TEMPLATES_PATH, MEDIA_PATH, ALLOWED_MEDIA_EXTENSIONS, UPLOAD_PATH
from utils import get_session, coincidence

blueprint = Blueprint(
    name='views',
    import_name=__name__,
    template_folder=TEMPLATES_PATH
)
login_manager = LoginManager()


@blueprint.before_request
def before():
    g.session = Session()


@blueprint.after_request
def after(response):
    g.session.connection().close()
    return response


@login_manager.user_loader
def load_user(uid):
    return g.session.query(User).get(uid)


@blueprint.route('/')
def index():
    is_system_call = request.args.get('rule') is not None and request.args.get('query') is not None

    if not is_system_call:
        previews = [
            url_for('static', filename=f'img/{filename}')
            for filename in os.listdir(MEDIA_PATH) if filename.startswith('preview-sketch')
        ]  # gets previews filenames and then convert them to relative path (from static)

        return render_template('index.html', previews=previews)

    limit = request.args.get('limit', 0, type=int)
    offset = request.args.get('offset', 0, type=int)
    rule = request.args.get('rule', 'any')
    query = request.args.get('query', '').lower()

    session = g.session

    matching = []
    for entry in session.query(Sketch).all():
        if rule == 'author':
            values = (entry.author.username, entry.author.login)
        elif rule == 'place':
            values = (entry.place,)
        elif rule == 'title':
            values = (entry.name,)
        elif rule == 'any':
            values = (entry.name, entry.place, entry.author.username, entry.author.login)
        else:
            return abort(404)

        mc = 0
        match = False
        for value in values:
            c = coincidence(value.lower(), query)
            if c > mc:
                mc = c
            if query in value.lower():
                match = True

        if mc >= 0.7 or match is True and entry not in map(lambda x: x[0], matching):
            matching.append((entry, mc))

    matching.sort(key=lambda m: (m[1] if query else True, m[0].time_created, m[0].id), reverse=True)
    return jsonify(status=200, data={'results_left': max(len(matching) - offset - limit, 0)},
                   rendered='\n'.join(render_template('sketch-preview.html', sketch=match[0])
                                      for match in matching[offset:offset + limit]))


@blueprint.route('/sketch')
def sketch():
    sid = request.args.get('sid')

    if sid is None:
        sid = randint(1, g.session.query(Sketch).count())
        return redirect(f'/sketch?{sid=}')

    sk = g.session.query(Sketch).get(sid)

    if not sk:
        abort(404)

    return jsonify(
        data={'sid': sid},
        rendered=render_template('sketch.html', sketch=sk, author=sk.author, followers_num=len(sk.author.followers))
    )


@blueprint.route('/auth', methods=['GET', 'POST'])
def auth():
    if current_user.is_authenticated:
        return redirect('/profile')

    form = LoginForm(new=bool(request.args.get('n')))

    if (user := form.validate_on_submit()) is False:  # validation failed or form just created
        return render_template('signin-form.html' if request.args.get('n') is None else 'signup-form.html', form=form)

    if user is None:
        session = g.session
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
    if user is None:
        return abort(404)  # request provided invalid uid

    if request.method == 'GET':
        is_system_call = request.args.get('limit') is not None and request.args.get('offset') is not None
        limit = request.args.get('limit', 0, type=int)
        offset = request.args.get('offset', 0, type=int)
        view = request.args.get('view', 'sketches')
        if not is_system_call or getattr(user, view, None) is None:
            # passing sketches_num, followers_num and follows_num as render_template params
            # since jinja cannot access these attributes with getattr(user, ...) due to lazy_loader
            return render_template('profile.html', user=user, sketches_num=len(user.sketches),
                                   followers_num=len(user.followers), follows_num=len(user.follows))
        results_left = max(len(getattr(user, view)) - offset - limit, 0)
        if view == 'sketches':
            it = sorted(user.sketches, key=lambda s: (s.time_created, s.id), reverse=True)
        else:
            it = sorted(getattr(user, view), key=lambda u: (u.username, u.login))
        return jsonify(status=200, data={'results_left': results_left}, rendered='\n'.join(render_template(
            'sketch-preview.html' if view == 'sketches' else 'user-preview.html',
            sketch=item, user=item, author_context=False
        ) for item in it[offset:offset + limit]))

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


@blueprint.route('/sketch/create', methods=['GET', 'POST'])
def sketch_create():
    if not current_user.is_authenticated:
        return redirect('/auth')

    form = SketchForm()
    session = g.session
    user_load = load_user(request.args.get('uid', getattr(current_user, 'id', None)))

    if not form.validate_on_submit():  # validation failed or form just created
        return render_template('sketch-form.html', form=form)
    sk = Sketch()

    sk.name = form.name.data
    sk.place = form.place.data
    sk.author_id = user_load.id

    tp = form.image.data.content_type.split('/')[1].lower()
    while (image_name := f'{uuid.uuid4()}.{tp}') in os.listdir(UPLOAD_PATH):
        pass

    form.image.data.save(os.path.join(UPLOAD_PATH, image_name))
    if sk.image_name in os.listdir(UPLOAD_PATH):
        os.remove(os.path.join(UPLOAD_PATH, sk.image_name))

    sk.image_name = image_name
    sk.time_created = datetime.now()

    session.add(sk)
    session.commit()

    return redirect(request.args.get('referrer', '/profile'))
