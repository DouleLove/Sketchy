__all__ = (
    'User',
)

import sqlalchemy
import sqlalchemy.orm as orm
from flask import url_for
from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash

from . import BaseModel

followings = sqlalchemy.Table(
    'followers',
    BaseModel.metadata,
    sqlalchemy.Column('user_id', sqlalchemy.Integer, sqlalchemy.ForeignKey('users.id')),
    sqlalchemy.Column('follower_id', sqlalchemy.Integer, sqlalchemy.ForeignKey('users.id'))
)


class User(BaseModel, UserMixin):
    __tablename__ = 'users'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True, unique=True)
    unique_name = sqlalchemy.Column(sqlalchemy.String(length=20), unique=True, index=True)
    username = sqlalchemy.Column(sqlalchemy.String(length=20, collation='NOCASE'), index=True)
    description = sqlalchemy.Column(sqlalchemy.String(length=120), default='')
    image = sqlalchemy.Column(sqlalchemy.String, default='default-avatar.svg')
    password_hash = sqlalchemy.Column(sqlalchemy.String)

    followers = orm.relationship(
        'User',
        secondary=followings,
        primaryjoin=id == followings.c.user_id,
        secondaryjoin=id == followings.c.follower_id,
        backref='follows'
    )
    sketches = orm.relationship(
        'Sketch',
        back_populates='author'
    )

    @property
    def login(self):
        return self.unique_name

    @login.setter
    def login(self, value):
        if self.login is None:
            self.username = value
        self.unique_name = value

    @property
    def password(self):
        return self.password_hash

    @password.setter
    def password(self, value):
        self.password_hash = generate_password_hash(value)

    def check_password(self, data):
        return check_password_hash(self.password, data)

    @property
    def avatar(self):
        return url_for('static', filename=f'img/uploads/{self.image}')
