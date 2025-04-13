__all__ = ()

from http import HTTPMethod, HTTPStatus

from flask import Response, abort, g, redirect, request
from flask_login import current_user, logout_user

import sketchy.handlers as handlers
import sketchy.utils as utils
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
def auth_view() -> Response:
    if current_user.is_authenticated:
        return redirect("/profile")

    form_or_response = handlers.auth_view_get_handler()
    if isinstance(form_or_response, Response):
        return form_or_response

    return handlers.auth_view_post_handler(form_or_response)


@g.app.route("/logout")
def logout_view() -> Response:
    logout_user()  # this will ignore non-authenticated users
    return redirect("/")


@g.app.route("/profile", methods=[HTTPMethod.GET, HTTPMethod.POST])
def profile_view() -> Response:
    if request.args.get("uid", current_user.is_authenticated) is False:
        # non-authenticated user tries to check their account, redirect to auth
        return redirect("/auth")

    uid = request.args.get("uid", type=int)
    login = request.args.get("username")

    if uid is not None and login is not None:
        return abort(HTTPStatus.BAD_REQUEST)

    try:
        user = User.get(uid, login)
    except (ValueError, TypeError):
        user = current_user

    if user is None:
        return abort(HTTPStatus.NOT_FOUND)  # request provided invalid uid

    if request.method == HTTPMethod.GET:
        return handlers.profile_view_get_handler(user)
    return handlers.profile_view_post_handler(user)


@g.app.route("/sketch/create", methods=[HTTPMethod.GET, HTTPMethod.POST])
def sketch_create_view() -> Response:
    if not current_user.is_authenticated:
        return redirect("/auth")

    form_or_response = handlers.sketch_create_view_get_handler()

    if isinstance(form_or_response, Response):
        return form_or_response

    return handlers.sketch_create_view_post_handler(form_or_response)


@g.app.route("/sketches", methods=[HTTPMethod.GET])
def sketches_list_view() -> Response:
    return handlers.sketches_list_view_get_handler()


@g.app.route("/imap", methods=[HTTPMethod.GET])
def imap_view() -> Response:
    coordinates = utils.parse_coordinates(request.args.get("coordinates"))
    outer_bounds = utils.parse_coordinates(
        request.args.get("outer"),
        length=4,
    )
    inner_bounds = utils.parse_coordinates(
        request.args.get("inner"),
        length=4,
    )

    if not outer_bounds:
        return handlers.imap_view_get_handler(coordinates)

    outer_bounds = [outer_bounds[:2], outer_bounds[2:]]
    if inner_bounds:
        inner_bounds = [inner_bounds[:2], inner_bounds[2:]]

    return handlers.imap_view_get_handler(
        outer_bounds=outer_bounds,  # type: ignore
        inner_bounds=inner_bounds,  # type: ignore
    )
