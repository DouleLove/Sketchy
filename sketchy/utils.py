__all__ = (
    "get_session",
    "request_contains_params",
)

import typing

import sqlalchemy.orm as orm
from flask import request

from sketchy.database import BaseModel


def request_contains_params(*args: str) -> bool:
    return bool(len(set(request.args) & set(args)) == len(args))


def get_session(instance: BaseModel) -> orm.Session:
    return orm.Session.object_session(instance)


def parse_coordinates(
    cords: typing.Any,  # for any type excluding str, will return None
    length: int = 2,
) -> list[float, float] | None:
    try:
        parsed = list(map(float, cords.split(",")))
        if len(parsed) != length:
            parsed = None
    except (ValueError, TypeError, AttributeError):
        parsed = None

    return parsed
