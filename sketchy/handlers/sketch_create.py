__all__ = (
    "sketch_create_view_get_handler",
    "sketch_create_view_post_handler",
)

import os
import uuid
from datetime import datetime

from flask import Response, g, redirect, render_template, request
from flask_login import current_user

import sketchy.settings as settings
from sketchy.database import Sketch
from sketchy.forms import SketchForm


def _generate_unique_image_name(extension: str) -> str:
    while True:
        image_name = f"{uuid.uuid4()}.{extension}"
        if image_name not in os.listdir(settings.MEDIA_ROOT):
            return image_name


def sketch_create_view_get_handler() -> Response | SketchForm:
    form = SketchForm()

    if not form.validate_on_submit():  # validation failed or form just created
        return Response(
            render_template(
                template_name_or_list="sketch-form.html",
                title="Создание скетча",
                form=form,
            ),
        )

    return form


def sketch_create_view_post_handler(form: SketchForm) -> Response:
    sketch = Sketch()

    sketch.name = form.name.data
    sketch.place = form.place.data
    sketch.author_id = current_user.id

    ext = form.pillow_image.format.lower()
    image_name = _generate_unique_image_name(ext)

    for size in ("small", "medium", "large"):
        root = settings.MEDIA_ROOT / size

        image = getattr(form, f"pillow_image_{size}")
        image.save(root / image_name, format=ext)

        previous_image_name = sketch.image_name
        if previous_image_name in os.listdir(root):
            os.remove(root / previous_image_name)

    sketch.image_name = image_name
    sketch.time_created = datetime.now()

    g.session.add(sketch)
    g.session.commit()

    return redirect(request.args.get("referrer", "/profile"))
