__all__ = ("index_view_get_handler",)

import os

from flask import Response, render_template, url_for

import sketchy.settings as settings


def index_view_get_handler() -> Response:
    previews = []
    # gets previews filenames and then
    # converts them to relative path (from static)
    for filename in os.listdir(settings.IMG_ROOT):
        if filename.startswith("preview-sketch"):
            previews.append(url_for("static", filename=f"img/{filename}"))

    return Response(
        render_template(
            template_name_or_list="index.html",
            title="Sketchy",
            previews=previews,
        ),
    )
