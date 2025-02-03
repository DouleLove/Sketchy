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

HOST = gnvext.StringEnvVariable(
    name="FLASK_APP_SERVER_HOST",
    default=RuntimeError("FLASK_APP_SERVER_HOST must be specified in .env")
).value

PORT = gnvext.IntegerEnvVariable(
    name="FLASK_APP_SERVER_PORT",
    default=RuntimeError("FLASK_APP_SERVER_PORT must be specified in .env")
).value

DEBUG = gnvext.BooleanEnvVariable(
    name="FLASK_APP_DEBUG",
    default=False,
).value

SECRET_KEY = gnvext.StringEnvVariable(
    name="FLASK_APP_SECRETKEY",
    default=RuntimeError("FLASK_APP_SECRETKEY must be specified in .env"),
).value

VIEWS_MODULES = [
    "sketchy.views",
]

ALLOWED_MEDIA_EXTENSIONS = ("JPEG", "JPG", "PNG")

del Path
del dotenv
del gnvext
