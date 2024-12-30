__all__ = ()

from http import HTTPMethod

from flask import Response, abort, g, redirect, request
from flask_login import current_user, logout_user

import sketchy.handlers as handlers
from sketchy.database import User


@g.app.route("/")
def index_view() -> Response:
    return handlers.index_view_get_handler()


@g.app.route("/sketch", methods=[HTTPMethod.GET, HTTPMethod.DELETE])
def sketch_view() -> Response:
    if request.method == HTTPMethod.GET:
        return handlers.sketch_view_get_handler()
    return handlers.sketch_view_delete_handler()


@g.app.route("/auth", methods=[HTTPMethod.GET, HTTPMethod.POST])
def auth_view():
    if current_user.is_authenticated:
        return redirect("/profile")

    response = handlers.auth_view_get_handler()
    if isinstance(response, Response):
        return response

    return handlers.auth_view_post_handler(*response)


@g.app.route("/logout")
def logout_view():
    logout_user()  # this will ignore non-authenticated users
    return redirect("/")


@g.app.route("/profile", methods=[HTTPMethod.GET, HTTPMethod.POST])
def profile_view():
    if request.args.get("uid", current_user.is_authenticated) is False:
        # non-authenticated user tries to check their account, redirect to auth
        return redirect("/auth")

    uid = request.args.get("uid")
    login = request.args.get("username")

    if uid is not None and login is not None:
        return abort(400)

    try:
        user = User.get(int(uid), login)  # type: ignore
    except (ValueError, TypeError):
        user = current_user

    if user is None:
        return abort(404)  # request provided invalid uid

    if request.method == HTTPMethod.GET:
        return handlers.profile_view_get_handler(user)
    return handlers.profile_view_post_handler(user)


@g.app.route("/sketch/create", methods=[HTTPMethod.GET, HTTPMethod.POST])
def sketch_create_view():
    if not current_user.is_authenticated:
        return redirect("/auth")

    form_or_response = handlers.sketch_create_view_get_handler()

    if isinstance(form_or_response, Response):
        return form_or_response

    return handlers.sketch_create_view_post_handler(form_or_response)


@g.app.route("/sketches", methods=[HTTPMethod.GET])
def sketches_list_view():
    return handlers.sketches_list_view_get_handler()