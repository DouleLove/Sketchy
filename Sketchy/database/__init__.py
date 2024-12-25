import sqlalchemy.orm as orm

BaseModel = orm.declarative_base()

from .models import *  # NOQA
from .session import *  # NOQA

del orm
