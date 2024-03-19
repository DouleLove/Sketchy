import os
from pathlib import Path

BASE_PATH = Path(__file__).parent.parent
APPLICATION_PATH = os.path.join(BASE_PATH, 'flask-project')
STATIC_PATH = os.path.join(APPLICATION_PATH, 'static')
MEDIA_PATH = os.path.join(STATIC_PATH, 'img')
DB_PATH = os.path.join(APPLICATION_PATH, 'database/db.sqlite3')
