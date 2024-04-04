from flask import Flask

import views
from settings import SERVER_HOST, SERVER_PORT

app = Flask(__name__)
app.config['SECRET_KEY'] = 'tmp-secret_key-should-be-replaced'
# app.config['SECRET_KEY'] = os['flask-app-secretkey']


def run():
    app.register_blueprint(views.blueprint)
    app.run(host=SERVER_HOST, port=SERVER_PORT)


if __name__ == '__main__':
    run()
