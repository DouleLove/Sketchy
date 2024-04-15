__all__ = (
    'Sketch',
)

import sqlalchemy
from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash
from sqlalchemy.orm import mapped_column
from sqlalchemy.orm import relationship

from . import BaseModel


# NOTE: all models should be collected here since this module
# stands as a generic module to be processed to BaseModel metadata

class Sketch(BaseModel):  # test model, should be removed or changed in future updates
    __tablename__ = 'sketch'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    user_id = sqlalchemy.Column(sqlalchemy.Integer, sqlalchemy.ForeignKey('users.id'))
    name = sqlalchemy.Column(sqlalchemy.String)
    author = sqlalchemy.Column(sqlalchemy.String)
    place = sqlalchemy.Column(sqlalchemy.String)
    sketch_path = sqlalchemy.Column(sqlalchemy.String)

    user = relationship('User', foreign_keys=[user_id])