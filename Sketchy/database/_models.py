__all__ = (
    'User',
)

import sqlalchemy
from flask_login import UserMixin
from werkzeug.security import check_password_hash, generate_password_hash

from . import BaseModel

# NOTE: all models should be collected here since this module
# stands as a generic module to be processed to BaseModel metadata


class User(BaseModel, UserMixin):  # test model, should be removed or changed in future updates
    __tablename__ = 'users'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    login = sqlalchemy.Column(sqlalchemy.String)
    password_hash = sqlalchemy.Column(sqlalchemy.String)

    @property
    def password(self):
        return self.password_hash

    @password.setter
    def password(self, value):
        self.password_hash = generate_password_hash(value)

    def check_password(self, data):
        return check_password_hash(self.password, data)
