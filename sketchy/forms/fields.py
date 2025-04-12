__all__ = (
    "PlaceField",
    "ImageField",
)

import typing

from wtforms import FileField, StringField

import sketchy.settings as settings


# custom fields

class PlaceField(StringField):
    """
    simple StringField, which only replaces type attribute,
    so we can use {% if field.type == 'PlaceField' %} in templates
    """


class ImageField(FileField):
    """
    FileField, which replaces type attribute, so we can use
    {% if field.type == 'ImageField' %} in templates, and provides
    property for working with html <input> "accept" attribute
    """

    def __init__(
        self,
        label: str = None,
        validators: typing.Iterable = None,
        allowed_media_extensions=...,
        **kwargs: typing.Any,
    ) -> None:
        super().__init__(label, validators, **kwargs)

        # if no extensions passed use those specified in settings
        if allowed_media_extensions == Ellipsis:
            allowed_media_extensions = settings.ALLOWED_MEDIA_EXTENSIONS

        self._allowed_media_extensions = allowed_media_extensions

    @property
    def accept(self) -> str:
        """
        property which returns appropriate value for html <input> "accept"
        attribute in format like "image/png, image/jpeg"
        """

        formats = (f"image/{ext}" for ext in self._allowed_media_extensions)
        return ", ".join(formats)
