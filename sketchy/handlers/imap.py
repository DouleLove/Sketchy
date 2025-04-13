__all__ = ("imap_view_get_handler",)

from http import HTTPStatus

from flask import Response, g, render_template, jsonify, url_for
from sqlalchemy import and_, or_

from sketchy.database import Sketch


def imap_view_get_handler(
    coordinates: list[float, float] = None,
    outer_bounds: list[list[float, float], list[float, float]] = None,
    inner_bounds: list[list[float, float], list[float, float]] = None,
) -> Response:
    if not outer_bounds:
        return Response(
            render_template(
                template_name_or_list="imap.html",
                title="Карта скетчей",
                coordinates=coordinates,
            ),
        )

    # filtering sketches which coordinates are inside the outer bounds
    query = g.session.query(Sketch).filter(
        and_(
            Sketch.longitude >= outer_bounds[0][0],
            Sketch.longitude <= outer_bounds[1][0],
            Sketch.latitude >= outer_bounds[0][1],
            Sketch.latitude <= outer_bounds[1][1],
        ),
    )
    if inner_bounds:
        # filtering sketches which are inside the outer bounds,
        # but outside the inner bounds
        query = query.filter(
            or_(
                Sketch.longitude < inner_bounds[0][0],
                Sketch.longitude > inner_bounds[1][0],
                Sketch.latitude < inner_bounds[0][1],
                Sketch.latitude > inner_bounds[1][1],
            ),
        )

    data = []
    for sketch in query.all():
        data.append(
            {
                "sid": sketch.id,
                "longitude": sketch.longitude,
                "latitude": sketch.latitude,
                "image": url_for(
                    "media",
                    filename=f"tiny/{sketch.image_name}",
                ),
            },
        )

    return jsonify(
        status=HTTPStatus.OK,
        data=data,
    )
