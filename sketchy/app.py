__all__ = ("Sketchy",)

import runpy
from typing import Any

from flask import Flask, Response, g, send_from_directory
from flask_login.login_manager import LoginManager
from flask_wtf import CSRFProtect

import sketchy.settings as settings
from sketchy.database import Session, User


class Sketchy:

    def __new__(cls, *args: Any, **kwargs: Any) -> Flask:
        app = Flask(*args, **kwargs)

        cls._setup(app)

        return app

    @classmethod
    def _setup(cls, app: Flask) -> None:
        login_manager = LoginManager()
        login_manager.user_loader(User.get)
        login_manager.init_app(app)

        CSRFProtect().init_app(app)

        with app.app_context():
            g.app = app

            app.before_request(cls.before_request)
            app.after_request(cls.after_request)

            for module in settings.VIEWS_MODULES:
                runpy.run_module(module)

        app.config["SECRET_KEY"] = settings.SECRET_KEY
        app.config["UPLOAD_FOLDER"] = settings.MEDIA_ROOT

        app.get("/media/<path:filename>")(cls.media)

    @classmethod
    def before_request(cls) -> None:
        g.session = Session()

    @classmethod
    def after_request(cls, response: Response) -> Response:
        g.session.connection().close()
        return response

    @classmethod
    def media(cls, filename: str) -> Response:
        return send_from_directory(
            settings.MEDIA_ROOT,
            filename,
            as_attachment=True,
        )
