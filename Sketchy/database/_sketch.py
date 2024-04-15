__all__ = (
    'Sketch',
)

import sqlalchemy
import sqlalchemy.orm as orm

from . import BaseModel


class Sketch(BaseModel):
    __tablename__ = 'sketches'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True, unique=True)
    name = sqlalchemy.Column(sqlalchemy.String)
    place = sqlalchemy.Column(sqlalchemy.String)
    image = sqlalchemy.Column(sqlalchemy.String, unique=True)
    author_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey('users.id'))

    author = orm.relationship('User')
