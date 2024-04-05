import importlib.util
from pathlib import Path

from flask import Flask, Blueprint

from settings import SERVER_HOST, SERVER_PORT, APP_CONFIG, APPLICATION_PATH


def _setup(app):
    # passing config from APP_CONFIG of settings.py to flask application instance
    for setting, value in APP_CONFIG.items():
        app.config[setting] = value

    # registering all blueprints found in application folder
    # (NOTE: python packages are ignored, so if there are blueprints
    #  inside package with __init__.py, they WILL NOT BE FOUND)
    for path in Path(APPLICATION_PATH).rglob('*.py'):  # find all .py files (recursive glob)
        filename = '.'.join(path.name.split('.')[:-1]).replace('\\', '/')

        # import module by absolute path
        try:
            spec = importlib.util.spec_from_file_location(filename, str(path))
            module = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(module)
        except ImportError:
            continue  # could not import file because of relative import (module placed inside python package)

        for obj in vars(module).values():  # iterating globals of file
            if isinstance(obj, Blueprint):
                app.register_blueprint(obj)  # register blueprint


def run():
    app = Flask(__name__)
    _setup(app)
    app.run(host=SERVER_HOST, port=SERVER_PORT)


if __name__ == '__main__':
    run()
