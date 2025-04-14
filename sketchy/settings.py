import os
from pathlib import Path

try:
    __import__("dotenv").load_dotenv()
except ImportError:
    pass

BASE_PATH = Path(__file__).parent.parent
APPLICATION_ROOT = BASE_PATH / "sketchy"
TEMPLATES_ROOT = APPLICATION_ROOT / "templates"
STATIC_ROOT = APPLICATION_ROOT / "static"
IMG_ROOT = STATIC_ROOT / "img"
MEDIA_ROOT = APPLICATION_ROOT / "media"
DB_ROOT = APPLICATION_ROOT / "database" / "root"
DB_PATH = DB_ROOT / "db.sqlite3"

MEDIA_ROOT_FOLDERS = ["tiny", "small", "medium", "large", "avatars"]

HOST = os.getenv("FLASK_APP_SERVER_HOST", default='127.0.0.1')
PORT = int(os.getenv("FLASK_APP_SERVER_PORT", default=8000))
DEBUG = os.getenv("FLASK_APP_DEBUG", default='False') in ('True', 'true', 'T', 't')
SECRET_KEY = os.getenv("FLASK_APP_SECRETKEY", default='')

VIEWS_MODULES = [
    "sketchy.views",
]

ALLOWED_MEDIA_EXTENSIONS = ("JPEG", "JPG", "PNG")

del os
del Path
