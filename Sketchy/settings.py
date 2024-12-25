import os
from pathlib import Path

import dotenv
import gnvext

dotenv.load_dotenv()

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
    'SECRET_KEY': gnvext.StringEnvVariable(
        name='FLASK_APP_SECRETKEY',
        default='tmp-secretkey-should-be-replaced',
    ).value,
}
APIKEY_GEOCODER = os.environ['YANDEX_GEOCODER_APIKEY']

ALLOWED_MEDIA_EXTENSIONS = ('JPEG', 'JPG', 'PNG')

del os
del Path
