__all__ = (
    "sketch_view_get_handler",
    "sketch_view_delete_handler",
)

from http import HTTPStatus

from flask import (
    Response,
    abort,
    g,
    jsonify,
    redirect,
    render_template,
    request,
)
from flask_login import current_user

from sketchy.database import Sketch


def sketch_view_get_handler() -> Response:
    sid = request.args.get("sid", type=int)

    if sid is None:
        sid = Sketch.random().id
        return redirect(f"/sketch?{sid=}")

    sketch = Sketch.get(sid)

    if not sketch:
        abort(HTTPStatus.NOT_FOUND)

    return jsonify(
        data={"sid": sid},
        rendered=render_template(
            "sketch.html",
            sketch=sketch,
            author=sketch.author,
            followers_num=len(sketch.author.followers),
        ),
    )


def sketch_view_delete_handler() -> Response:
    sid = request.args.get("sid", type=int)
    sketch = Sketch.get(sid)

    if not sketch or current_user.id != sketch.author.id:
        return jsonify(
            status=HTTPStatus.BAD_REQUEST,
            rendered=render_template(
                template_name_or_list="response-message.html",
                status=HTTPStatus.BAD_REQUEST,
                description="Что-то пошло не так",
            ),
        )

    g.session.delete(sketch)
    g.session.commit()

    return jsonify(status=HTTPStatus.OK)
