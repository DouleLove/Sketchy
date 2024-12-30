__all__ = (
    'get_session',
    'mkdirs_if_not_exist',
    'request_contains_params',
)

import os

import sqlalchemy.orm as orm
from flask import request

from sketchy.database import BaseModel


def mkdirs_if_not_exist(*paths: str) -> None:
    for path in paths:
        if not os.path.exists(path):
            os.mkdir(path)


def request_contains_params(*args: str) -> bool:
    return bool(len(set(request.args) & set(args)) == len(args))


def get_session(instance: BaseModel) -> orm.Session:
    return orm.Session.object_session(instance)
