__all__ = ("Session",)

from typing import Any

import sqlalchemy
import sqlalchemy.orm as orm

import sketchy.settings as settings

from . import BaseModel

engine = sqlalchemy.create_engine(
    f"sqlite:///{settings.DB_PATH}?check_same_thread=False",
    echo=False,
)
sessionmaker = orm.sessionmaker(bind=engine)

# will be passed as metadata of BaseModel
from . import _metadata  # noqa

BaseModel.metadata.create_all(engine)


class Session:

    def __new__(cls, *args: Any, **kwargs: Any) -> orm.Session:
        return sessionmaker()
