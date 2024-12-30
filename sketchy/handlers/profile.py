__all__ = (
    "profile_view_get_handler",
    "profile_view_post_handler",
)

import os
import uuid
from http import HTTPStatus

from flask import Response, jsonify, render_template, request
from flask_login import current_user

import sketchy.settings as settings
from sketchy.database import User
from sketchy.utils import get_session, request_contains_params


def profile_view_get_handler(user: User) -> Response:
    limit = request.args.get("limit", 0, type=int)
    offset = request.args.get("offset", 0, type=int)
    view = request.args.get("view", "sketches")

    if (
        not request_contains_params("limit", "offset")
        or getattr(user, view, None) is None
    ):
        # passing sketches_num, followers_num and follows_num
        # as render_template params since jinja cannot access
        # these attributes with getattr(user, ...) due to lazy_loader
        return Response(
            render_template(
                template_name_or_list="profile.html",
                user=user,
                sketches_num=len(user.sketches),
                followers_num=len(user.followers),
                follows_num=len(user.follows),  # type: ignore
            ),
        )

    results_left = max(len(getattr(user, view)) - offset - limit, 0)
    if view == "sketches":
        items = sorted(
            user.sketches, key=lambda s: (s.time_created, s.id), reverse=True
        )
        template = "sketch-preview.html"
    else:
        items = sorted(
            getattr(user, view), key=lambda u: (u.username, u.login)
        )
        template = "user-preview.html"

    rendered = []
    for item in items[offset : offset + limit]:
        rendered.append(
            render_template(
                template_name_or_list=template,
                sketch=item,
                user=item,
                author_context=False,
            )
        )

    return jsonify(
        status=HTTPStatus.OK,
        data={"results_left": results_left},
        rendered="\n".join(rendered),
    )


def profile_view_post_handler(user: User) -> Response:
    errors = {}
    params = request.form
    attachments = dict(
        (field.split("-")[0], files) for field, files in request.files.items()
    )

    for param, value in params.items():
        if param == "username":
            if not value:
                errors[param] = "Отображаемое имя не указано"
                continue
            user.username = value
        if param == "description":
            user.description = value
        if param == "image":
            if (attachment := attachments.get(param)) is None:
                errors[param] = "Изображение не выбрано"
                continue
            tp = attachment.content_type.split("/")[-1]
            if tp.upper() not in settings.ALLOWED_MEDIA_EXTENSIONS:
                errors[param] = "Неподдерживаемый тип файла"
                continue
            if (
                user.image
                and os.path.isfile(settings.MEDIA_ROOT / user.image)
            ):
                os.remove(settings.MEDIA_ROOT / user.image)
            # generate unique filename
            while (image_name := f"{uuid.uuid4()}.{tp.lower()}") in os.listdir(
                settings.MEDIA_ROOT
            ):
                pass
            user.image = image_name
            # save filename to media folder
            attachment.save(settings.MEDIA_ROOT / user.image)
        if param == "followers":
            # merge current_user to user's session
            # to not access current_user in different threads
            merged = get_session(user).merge(current_user)
            if value == "false" and current_user not in user.followers:
                user.followers.append(merged)
            elif value == "true" and current_user in user.followers:
                user.followers.remove(merged)
            else:
                errors[param] = "Не удалось синхронизировать данные с сервером"

    if errors:
        return jsonify(
            status=HTTPStatus.BAD_REQUEST,
            errors=errors,
            rendered=render_template(
                template_name_or_list="response-message.html",
                status=HTTPStatus.BAD_REQUEST,
                description="\n".join(errors[error] for error in errors),
            ),
        )

    # creating response json before commit because it will close user's session
    response = jsonify(
        status=HTTPStatus.OK,
        user_data={"avatar": user.image},
        rendered=render_template(
            template_name_or_list="response-message.html",
            status=HTTPStatus.OK,
            description="Изменения профиля сохранены",
        ),
    )

    get_session(user).commit()

    return response
