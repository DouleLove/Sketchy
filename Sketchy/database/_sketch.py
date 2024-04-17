__all__ = (
    'Sketch',
)

import sqlalchemy
import sqlalchemy.orm as orm
from flask import url_for

from . import BaseModel


class Sketch(BaseModel):
    __tablename__ = 'sketches'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True, unique=True)
    name = sqlalchemy.Column(sqlalchemy.String)
    place = sqlalchemy.Column(sqlalchemy.String)
    image = sqlalchemy.Column(sqlalchemy.String, unique=True)
    author_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey('users.id'))


class Sketch(BaseModel):
    __tablename__ = 'sketches'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True, unique=True)
    name = sqlalchemy.Column(sqlalchemy.String)
    place = sqlalchemy.Column(sqlalchemy.String)
    image_name = sqlalchemy.Column(sqlalchemy.String)
    author_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey('users.id'))

    author = orm.relationship('User')

    @property
    def image(self):
        return url_for('static', filename=f'img/uploads/{self.image_name}')

    @image.setter
    def image(self, value):
        self.image_name = value
