__all__ = (
    'User',
)

import sqlalchemy

from . import BaseModel

# NOTE: all models should be collected here since this module
# stands as a generic module to be processed to BaseModel metadata


class User(BaseModel):  # test model, should be removed or changed in future updates
    __tablename__ = 'users'

    id = sqlalchemy.Column(sqlalchemy.Integer, primary_key=True, autoincrement=True)
    name = sqlalchemy.Column(sqlalchemy.String)
