__all__ = (
    'get_session',
    'is_existing_place',
    'coincidence'
)

from difflib import SequenceMatcher

import requests
import sqlalchemy.orm as orm

from settings import APIKEY_GEOCODER


def is_existing_place(place):
    url = f'http://geocode-maps.yandex.ru/1.x/'
    params = {
        'apikey': APIKEY_GEOCODER,
        'geocode': place,
        'format': 'json'
    }

    response = requests.get(url, params=params)

    if response.status_code == 200:
        return bool(int(response.json()["response"]["GeoObjectCollection"]
                        ["metaDataProperty"]["GeocoderResponseMetaData"]['found']))

    return False


def coincidence(a, b):
    return SequenceMatcher(None, a, b).ratio()


def get_session(instance):
    return orm.Session.object_session(instance)
