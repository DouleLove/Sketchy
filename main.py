__all__ = ()
__license__ = 'MIT'
__version__ = '3.11'

import os
import runpy


def _get_app_name():

    def _is_python_package(relative):
        return os.path.isdir(relative) and '__init__.py' in os.listdir(relative)

    for name in os.listdir():  # search in the same folder
        if _is_python_package(name):  # application expected to be a python package
            return name


def main():
    try:
        runpy.run_module(
            _get_app_name(),
            run_name='__main__',  # fake __name__ global var to make module.__main__ running
        )
    except AttributeError:
        raise RuntimeError(
            'Could not find application to execute, make sure your application is python package'
        ) from None
    except ModuleNotFoundError as exc:
        missing = str(exc).split()[-1].replace("'", '"')
        raise RuntimeError(f'Could not find module {missing}, make sure it is installed') from None


if __name__ == '__main__':
    main()
