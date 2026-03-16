import os
import pathlib


def uglify(
    from_: str,
    to_: str = ...,
    parameters: list[str] = None,
    reserved_keywords: list[str] = None,
    exclude: list[str] = None,
    base_path: str = ...,
) -> None:
    if to_ == Ellipsis:
        to_ = from_
    if not parameters:
        parameters = []
    if reserved_keywords:
        _quoted = (f"'{kw}'" for kw in reserved_keywords)
        _joined = ','.join(_quoted)
        reserved_keywords = f'[{_joined}]'

    if base_path == Ellipsis:
        base_path = pathlib.Path(__file__).resolve().parent
    os.chdir(base_path)

    to_ = pathlib.Path(to_)
    from_ = pathlib.Path(from_)

    if not to_.exists():
        to_.mkdir()

    for filename in os.listdir(from_):
        if not (from_ / filename).is_file():
            continue

        params = [
            'uglifyjs',
            f'"{from_ / filename}"',
            *parameters,
            f'"reserved={reserved_keywords}"',
            '-o',
            f'"{to_ / filename}"',
        ]
        if reserved_keywords is None:
            params.pop(-3)

        os.system(' '.join(params).replace('\\', '/'))


if __name__ == '__main__':
    exclude = [
        'roundedimap.js',
    ]
    reserved_keywords = [
        'uid',
        'sid',
        'view',
        'referrer',
        'image',
        'place',
        'imsize',
        'crop',
        'csrf_token',
        'name',
        'inner',
        'outer',
        'limit',
        'offset',
        'login',
        'password',
        'n',
        'type',
        'url',
        'data',
        'processData',
        'contentType',
        'xhr',
        'async',
        'cache',
        'success',
        'center',
        'zoom',
        'closeable',
        'placemarkDefaultBackgroundImage',
        'placemarkDefaultForegroundImage',
        'placemarkDefaultBackgroundSize',
        'placemarkDefaultBackgroundOffset',
        'placemarkDefaultForegroundSize',
        'placemarkDefaultForegroundOffset',
        'coordinates',
        'onBoundsChange',
        'postInit',
        'sketches',
        'followers',
        'follows',
        'query',
        '__bounds',
        'centerNoGeolocation',
        'showOnInit',
        'autoResize',
        'show',
        'hide',
        'toggle',
        'geoBounds',
        'singleMarker',
        'setPlacemarkOnclick',
        'placemarkBalloonDefaultText',
        'placemarkBalloonOffset',
        'addSketchMarker',
        'controls',
        'minZoom',
        'restrictMapArea',
        'suppressMapOpenBlock',
        'yandexMapDisablePoiInteractivity',
    ]
    from_ = 'js'
    to_ = 'uglified-js'
    parameters = [
        '-c',
        '-m',
        '--mangle-props',
    ]

    uglify(
        from_=from_,
        to_=to_,
        exclude=exclude,
        parameters=parameters,
        reserved_keywords=reserved_keywords,
    )
    exclude = [fn for fn in os.listdir(from_) if fn != 'sketches-map.js']
    parameters.pop()
    uglify(
        from_=from_,
        to_=to_,
        exclude=exclude,
        parameters=parameters,
        reserved_keywords=reserved_keywords,
    )
