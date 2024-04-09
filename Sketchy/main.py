__all__ = ()

from pathlib import Path

from flask import Flask, Blueprint
from flask_login import LoginManager

from settings import SERVER_HOST, SERVER_PORT, DEBUG, APP_CONFIG, APPLICATION_PATH


def _setup(app):
    # passing config from APP_CONFIG of settings.py to flask application instance
    for setting, value in APP_CONFIG.items():
        app.config[setting] = value

    for path in Path(APPLICATION_PATH).rglob('*.py'):  # find all .py files in application folder
        # prepare filename to be passed into __import__ to format like 'package1.package2...packageN.module_name'
        filename = '.'.join(str(path).replace(APPLICATION_PATH, '').split('.')[:-1]).strip('\\').replace('\\', '.')

        module = __import__(filename)  # import module

        for obj in module.__dict__.values():  # iterating globals of file
            if isinstance(obj, Blueprint):
                app.register_blueprint(obj)  # register blueprint (flask.Blueprint instance)
            elif isinstance(obj, LoginManager):
                obj.init_app(app)  # register login manager (flask_login.LoginManager instance)


def run():
    app = Flask(__name__)
    _setup(app)
    app.run(host=SERVER_HOST, port=SERVER_PORT, debug=DEBUG)


if __name__ == '__main__':
    run()
