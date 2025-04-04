__all__ = ()
__title__ = "Sketchy"
__version__ = "3.11"
__license__ = "MIT"

import sketchy.settings as settings
from sketchy.app import Sketchy


def run() -> None:
    sketchy = Sketchy()
    sketchy.run(
        host=settings.HOST,
        port=settings.PORT,
        debug=settings.DEBUG,
    )


if __name__ == "__main__":
    run()
