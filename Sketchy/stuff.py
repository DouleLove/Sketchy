from database import Sketch, Session
from difflib import SequenceMatcher
import requests
from settings import API_GEOCODER


def coincidence(a, b):
    return SequenceMatcher(None, a, b).ratio()


def render_sketches(benchmark, rule):
    all_sketches = Session().query(Sketch).all()
    all_out = ''
    for sketch in all_sketches:
        sketch_benchmark = eval(f'sketch.{benchmark}')
        if coincidence(sketch_benchmark, rule) >= 0.7:
            all_out += sketch_benchmark
            # all_out += render_template('sketch.html', sketch=sketch)
    return str(all_out)


def place_exists(place):
    url = f'http://geocode-maps.yandex.ru/1.x/?apikey={API_GEOCODER}&geocode={place}&format=json'
    resp = requests.get(url)
    if resp.status_code == 200:
        return bool(
            int(resp.json()["response"]["GeoObjectCollection"]["metaDataProperty"]["GeocoderResponseMetaData"]['found']))
    else:
        return resp.status_code

