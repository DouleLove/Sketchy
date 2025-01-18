__all__ = ("sketches_list_view_get_handler",)

import difflib
from http import HTTPStatus

from flask import Response, g, jsonify, render_template, request

from sketchy.database import Sketch
from sketchy.utils import request_contains_params


def _coincidence(a: str, b: str) -> float:
    return difflib.SequenceMatcher(None, a, b).ratio()


def _search_sketches(
    query: str, limit: int = 30, offset: int = 0
) -> list[Sketch]:
    matching = []
    for entry in g.session.query(Sketch).all():
        values = (
            entry.name,
            entry.place,
            entry.author.username,
            entry.author.login,
        )

        mc = 0
        for value in map(str.lower, values):  # type: ignore
            if query in value:
                c = 0.95
            elif value in query:
                c = sum(_coincidence(v, query) for v in values)
            else:
                c = _coincidence(value, query)
            if c > mc:
                mc = c

        if mc >= 0.7:
            matching.append((entry, mc))

    matching.sort(
        key=lambda m: (m[1] if query else True, m[0].time_created, m[0].id),
        reverse=True,
    )

    items = []
    for idx in range(offset, offset + limit):
        try:
            items.append(matching[idx][0])
        except IndexError:
            break

    return items


def sketches_list_view_get_handler() -> Response:
    if not request_contains_params("limit", "offset"):
        return Response(
            render_template(
                template_name_or_list="sketches.html",
                title="Скетчи",
            )
        )

    limit = request.args.get("limit", 30, type=int)
    offset = request.args.get("offset", 0, type=int)
    query = request.args.get("query", "")

    items = _search_sketches(
        query=query.lower(),
        limit=limit + 1,
        offset=offset,
    )

    return jsonify(
        status=HTTPStatus.OK,
        data={
            "results_left": max(0, len(items) - limit),
            "title": f"{query} - Поиск скетчей" if query else "Скетчи",
        },
        rendered="\n".join(
            render_template(
                template_name_or_list="sketch-preview.html",
                sketch=items[idx],
            )
            for idx in range(len(items))
            if idx != limit
        ),
    )
