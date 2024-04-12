__all__ = (
    'User',
)

import sqlalchemy
from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from . import BaseModel


# NOTE: all models should be collected here since this module
# stands as a generic module to be processed to BaseModel metadata


class User(BaseModel, UserMixin):  # test model, should be removed or changed in future updates
    __tablename__ = 'users'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    login = sqlalchemy.Column(sqlalchemy.String)
    password_hash = sqlalchemy.Column(sqlalchemy.String)
    sketches = relationship('Sketch')
    @property
    def password(self):
        return self.password_hash

    @password.setter
    def password(self, value):
        self.password_hash = generate_password_hash(value)

    def check_password(self, data):
        return check_password_hash(self.password, data)


class Sketch(BaseModel):  # test model, should be removed or changed in future updates
    __tablename__ = 'sketch'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    user_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey('users.id'))
    name = sqlalchemy.Column(sqlalchemy.String)
    author = sqlalchemy.Column(sqlalchemy.String)
    place = sqlalchemy.Column(sqlalchemy.String)
    sketch_path = sqlalchemy.Column(sqlalchemy.String)

    user = relationship('User', foreign_keys=[user_id])