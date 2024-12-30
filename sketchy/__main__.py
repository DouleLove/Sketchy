__all__ = ()
__title__ = "Sketchy"
__version__ = "3.11"
__license__ = "MIT"

import sketchy.settings as settings
from sketchy.app import Sketchy


def run() -> None:
    app = Sketchy(__name__)
    app.run(
        host=settings.SERVER_HOST,
        port=settings.SERVER_PORT,
        debug=settings.DEBUG,
    )


if __name__ == "__main__":
    run()
