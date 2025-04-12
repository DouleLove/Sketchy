from __future__ import annotations

__all__ = ("Sketch",)

import sqlalchemy
import sqlalchemy.orm as orm
from flask import url_for

from . import BaseModel


class Sketch(BaseModel):
    __tablename__ = "sketches"

    id = sqlalchemy.Column(
        sqlalchemy.Integer,
        primary_key=True,
        autoincrement=True,
        unique=True,
    )
    name = sqlalchemy.Column(sqlalchemy.String(length=40))
    longitude = sqlalchemy.Column(
        sqlalchemy.Float,
        nullable=True,
        default=None,
    )
    latitude = sqlalchemy.Column(
        sqlalchemy.Float,
        nullable=True,
        default=None,
    )
    image_name = sqlalchemy.Column(sqlalchemy.String)
    author_id = sqlalchemy.Column(
        sqlalchemy.Integer,
        sqlalchemy.ForeignKey("users.id"),
    )
    time_created = sqlalchemy.Column(sqlalchemy.DateTime)

    author = orm.relationship("User")

    @property
    def image(self) -> str:
        return url_for("media", filename=self.image_name)

    @image.setter
    def image(self, value: str) -> None:
        self.image_name = value
