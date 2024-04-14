import os
from pathlib import Path

BASE_PATH = Path(__file__).parent.parent
APPLICATION_PATH = os.path.join(BASE_PATH, 'Sketchy')
TEMPLATES_PATH = os.path.join(APPLICATION_PATH, 'templates')
STATIC_PATH = os.path.join(APPLICATION_PATH, 'static')
MEDIA_PATH = os.path.join(STATIC_PATH, 'img')
UPLOAD_PATH = os.path.join(MEDIA_PATH, 'uploads')
DB_PATH = os.path.join(APPLICATION_PATH, 'database/root/db.sqlite3')

SERVER_HOST = '127.0.0.1'
SERVER_PORT = 8000
DEBUG = False

APP_CONFIG = {
    'SECRET_KEY': os.environ.get('flask-app-secretkey', 'tmp-secretkey-should-be-replaced'),
}

ALLOWED_MEDIA_EXTENSIONS = ['JPEG', 'JPG', 'PNG', 'GIF', 'TIFF']

del os
del Path
