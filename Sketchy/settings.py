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
API_GEOCODER = '2a3270c9-8a5c-4543-b243-1b5f0010a2ac' # через environ.get в будущем

ALLOWED_MEDIA_EXTENSIONS = ['JPEG', 'JPG', 'PNG', 'GIF', 'TIFF']

del os
del Path
