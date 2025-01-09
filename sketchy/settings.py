from pathlib import Path

import dotenv
import gnvext

dotenv.load_dotenv()

BASE_PATH = Path(__file__).parent.parent
APPLICATION_ROOT = BASE_PATH / "sketchy"
TEMPLATES_ROOT = APPLICATION_ROOT / "templates"
STATIC_ROOT = APPLICATION_ROOT / "static"
IMG_ROOT = STATIC_ROOT / "img"
MEDIA_ROOT = APPLICATION_ROOT / "media"
DB_ROOT = APPLICATION_ROOT / "database" / "root"
DB_PATH = DB_ROOT / "db.sqlite3"

SERVER_HOST = "127.0.0.1"
SERVER_PORT = 8000
DEBUG = False

SECRET_KEY = gnvext.StringEnvVariable(
    name="FLASK_APP_SECRETKEY",
    default=RuntimeError("FLASK_APP_SECRETKEY must be specified in .env"),
).value

VIEWS_MODULES = [
    "sketchy.views",
]

ALLOWED_MEDIA_EXTENSIONS = ("JPEG", "JPG", "PNG")

APIKEY_GEOCODER = gnvext.StringEnvVariable(
    name="YANDEX_GEOCODER_APIKEY",
    default=RuntimeError("APIKEY_GEOCODER must be specified in .env"),
).value

del Path
del dotenv
del gnvext
