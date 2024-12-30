__all__ = (
    "get_session",
    "request_contains_params",
)

import sqlalchemy.orm as orm
from flask import request

from sketchy.database import BaseModel


def request_contains_params(*args: str) -> bool:
    return bool(len(set(request.args) & set(args)) == len(args))


def get_session(instance: BaseModel) -> orm.Session:
    return orm.Session.object_session(instance)
