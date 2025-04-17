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


def parse_floats_list(
    string: typing.Any,  # for any type excluding str, will return None
    length: int = None,
) -> list[float, float] | None:
    try:
        parsed = list(map(float, string.split(",")))
        if length and len(parsed) != length:
            parsed = None
    except (ValueError, TypeError, AttributeError):
        parsed = None

    return parsed
