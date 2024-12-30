__all__ = ("BaseModel",)

import random
from typing import Self

import sqlalchemy.orm as orm
from flask import g


class BaseModel(orm.DeclarativeBase):

    @classmethod
    def random(cls) -> Self:
        query = g.session.query(cls)
        row_count = int(query.count())
        row = query.offset(random.randrange(row_count)).limit(1).first()
        return row

    @classmethod
    def get(cls, identifier: int) -> Self:
        return (
            g.session.query(cls)
            .filter(cls.id == identifier)  # type: ignore
            .first()
        )
