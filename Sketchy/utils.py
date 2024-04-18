__all__ = (
    'lazy_loader',
    'get_session',
    'is_alive',
    'is_existing_place',
    'coincidence'
)

from difflib import SequenceMatcher

import requests
import sqlalchemy.orm as orm

from settings import APIKEY_GEOCODER


def is_existing_place(place):
    params = {
        'apikey': APIKEY_GEOCODER,
        'geocode': place,
        'format': 'json'
    }
    url = f'http://geocode-maps.yandex.ru/1.x/'

    response = requests.get(url, params=params)

    if response.status_code == 200:
        return bool(int(response.json()["response"]["GeoObjectCollection"]
                                       ["metaDataProperty"]["GeocoderResponseMetaData"]['found']))

    return response.status_code


def coincidence(a, b):
    return SequenceMatcher(None, a, b).ratio()


def get_session(instance):
    return orm.Session.object_session(instance)


def is_alive(session):
    return bool(session and session.is_active and not session.dirty and not session.deleted and not session.new)


def lazy_loader(fn):
    cached = {}

    def _wrapper(*args, **kwargs):
        key = f'{args}{kwargs}'

        if not cached.get(key) or not is_alive(get_session(cached[key])):
            cached[key] = fn(*args, **kwargs)
        return cached[key]

    return _wrapper
