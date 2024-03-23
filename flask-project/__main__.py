from . import app
from .settings import SERVER_HOST, SERVER_PORT


def run():
    app.run(host=SERVER_HOST, port=SERVER_PORT)


if __name__ == '__main__':
    run()
