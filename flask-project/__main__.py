from flask import Flask, Blueprint
import os
import views
from settings import SERVER_HOST, SERVER_PORT

app = Flask(__name__)
app.config['SECRET_KEY'] = 'penis'


def run():
    app.register_blueprint(views.blueprint)
    app.run(host=SERVER_HOST, port=SERVER_PORT)


if __name__ == '__main__':
    run()
