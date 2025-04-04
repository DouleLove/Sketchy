__all__ = ()
__title__ = "Sketchy"
__version__ = "3.11"
__license__ = "MIT"


import sketchy.settings as settings
from sketchy.app import Sketchy


def _migrate_images() -> None:
    import functools
    import os
    import pathlib

    import PIL.Image

    from sketchy.forms.sketch_create import SketchForm

    # small, medium, large, avatars folders are already created by this moment

    mediafiles = set(filter(
        lambda fn: os.path.isfile(settings.MEDIA_ROOT / fn),
        os.listdir(settings.MEDIA_ROOT),
    ))

    class SketchFormImageMock:

        def __init__(self, image_path: pathlib.Path) -> None:
            self._image_path = image_path

        @property
        def pillow_image(self) -> PIL.Image.Image:
            image = PIL.Image.open(self._image_path)
            image.format = image.format or self._image_path.suffix.strip('.')
            return image

        @property
        def image_name(self) -> str:
            return self._image_path.name.removeprefix('ORIGINAL_')

    sizes = ("small", "medium", "large")
    widths = dict(
        (size, getattr(SketchForm, f"{size.upper()}_IMAGE_WIDTH"))
        for size in sizes
    )
    widths.update({'avatars': 300})
    for filename in mediafiles:
        if filename.startswith('ORIGINAL_'):
            continue

        if f'ORIGINAL_{filename}' not in mediafiles:
            is_avatar = True
        else:
            is_avatar = False
            filename = f'ORIGINAL_{filename}'

        sketch_form_mock = SketchFormImageMock(settings.MEDIA_ROOT / filename)

        resizer = functools.partial(
            SketchForm._resize_with_aspect_ratio,  # noqa
            sketch_form_mock,
        )

        for size in ('avatars',) if is_avatar else sizes:
            resized = resizer(width=widths[size])
            resized.save(
                settings.MEDIA_ROOT / size / sketch_form_mock.image_name,
                format=resized.format,
            )


def run() -> None:
    sketchy = Sketchy()
    _migrate_images()
    sketchy.run(
        host=settings.HOST,
        port=settings.PORT,
        debug=settings.DEBUG,
    )


if __name__ == "__main__":
    run()
