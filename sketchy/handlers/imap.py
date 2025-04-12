__all__ = ("imap_view_get_handler",)

from flask import Response, render_template


def imap_view_get_handler(
    coordinates: list[float, float] = None,
    top_left: list[float, float] = None,
    bottom_right: list[float, float] = None,
) -> Response:
    if not top_left or not bottom_right:
        return Response(
            render_template(
                template_name_or_list="imap.html",
                title="Карта скетчей",
                coordinates=coordinates,
            )
        )
