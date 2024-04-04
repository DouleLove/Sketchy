import os
from pathlib import Path

BASE_PATH = Path(__file__).parent.parent
APPLICATION_PATH = os.path.join(BASE_PATH, 'Sketchy')
STATIC_PATH = os.path.join(APPLICATION_PATH, 'static')
MEDIA_PATH = os.path.join(STATIC_PATH, 'img')
DB_PATH = os.path.join(APPLICATION_PATH, 'database/db.sqlite3')

SERVER_HOST = '127.0.0.1'
SERVER_PORT = 8000
