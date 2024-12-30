from __future__ import annotations

__all__ = ("User",)

import sqlalchemy
import sqlalchemy.orm as orm
from flask import g, url_for
from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash

from . import BaseModel

followings = sqlalchemy.Table(
    "followers",
    BaseModel.metadata,
    sqlalchemy.Column(
        "user_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("users.id")
    ),
    sqlalchemy.Column(
        "follower_id", sqlalchemy.Integer, sqlalchemy.ForeignKey("users.id")
    ),
)


class User(BaseModel, UserMixin):
    __tablename__ = "users"

    id = sqlalchemy.Column(
        sqlalchemy.Integer,
        primary_key=True,
        autoincrement=True,
        unique=True,
    )
    unique_name = sqlalchemy.Column(
        sqlalchemy.String(length=20),
        unique=True,
        index=True,
    )
    username = sqlalchemy.Column(
        sqlalchemy.String(length=20, collation="NOCASE"),
        index=True,
    )
    description = sqlalchemy.Column(
        sqlalchemy.String(length=120),
        default="",
    )
    image = sqlalchemy.Column(
        sqlalchemy.String,
        nullable=True,
    )
    password_hash = sqlalchemy.Column(sqlalchemy.String)

    followers = orm.relationship(
        "User",
        secondary=followings,
        primaryjoin=id == followings.c.user_id,
        secondaryjoin=id == followings.c.follower_id,
        backref="follows",
    )
    sketches = orm.relationship("Sketch", back_populates="author")

    @property
    def login(self) -> str:
        return self.unique_name

    @login.setter
    def login(self, value: str) -> None:
        if self.login is None:
            self.username = value
        self.unique_name = value

    @property
    def password(self) -> str:
        return self.password_hash

    @password.setter
    def password(self, value: str) -> None:
        self.password_hash = generate_password_hash(value)

    def check_password(self, data: str) -> bool:
        return check_password_hash(self.password, data)

    @property
    def avatar(self) -> str:
        if self.image is None:
            return url_for("static", filename="img/default-avatar.svg")
        return url_for("media", filename=self.image)

    @classmethod
    def get(cls, identifier: int = None, login: str = None) -> User:
        if identifier is not None and login is None:
            return super().get(identifier)  # type: ignore
        elif identifier is None and login is not None:
            return (
                g.session.query(cls).filter(cls.unique_name == login).first()
            )

        raise ValueError("Must be specified exactly one of: id, login")
