__all__ = (
    'Session',
)

import sqlalchemy
import sqlalchemy.orm as orm

from Sketchy.settings import DB_PATH
from . import BaseModel

engine = sqlalchemy.create_engine(
    f'sqlite:///{DB_PATH}?check_same_thread=False',
    echo=False
)
sessionmaker = orm.sessionmaker(bind=engine)

from . import models  # NOQA  # add _models module to locals so metadata of BaseModel could access it

BaseModel.metadata.create_all(engine)


class Session:

    def __new__(cls, *args, **kwargs):
        return sessionmaker()
