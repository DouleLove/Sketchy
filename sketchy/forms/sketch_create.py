__all__ = ("SketchForm",)

from functools import cached_property
from typing import Iterable

import PIL.Image
from flask_wtf import FlaskForm
from flask_wtf.file import FileRequired
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired, Length, ValidationError

import sketchy.settings as settings
import sketchy.utils as utils

from .fields import ImageField, PlaceField


class ImageExtensionValidator:

    def __init__(
        self,
        allowed_extensions: Iterable[str],
        message: str = "",
    ) -> None:
        self._allowed_extensions = allowed_extensions
        self._message = message

    def get_image_format(self, image: PIL.Image.Image) -> str | None:
        if image is None:
            raise ValidationError(self._message)

        if (image_format := image.format) is not None:
            return image_format.upper()

    def _image_extension_is_allowed(self, image: PIL.Image.Image) -> bool:
        return self.get_image_format(image) in self._allowed_extensions

    def __call__(self, image: PIL.Image.Image) -> None:
        if not self._image_extension_is_allowed(image):
            raise ValidationError(self._message)


class ImageAspectRatioValidator:

    def __init__(
        self,
        min_ratio: float = 0,
        max_ratio: float = float("inf"),
        message_less_than_min_ratio: str = "",
        message_greater_than_max_ratio: str = "",
    ) -> None:
        self._min_ratio = min_ratio
        self._max_ratio = max_ratio
        self._message_less_than_min_ratio = message_less_than_min_ratio
        self._message_greater_than_max_ratio = message_greater_than_max_ratio

        if self._min_ratio > self._max_ratio:
            raise ValueError("min_ratio cannot be greater than max_ratio")

    def __call__(self, image: PIL.Image.Image) -> None:
        aspect_ratio = image.width / image.height

        if self._min_ratio <= aspect_ratio <= self._max_ratio:
            return

        if self._min_ratio > aspect_ratio:
            raise ValidationError(self._message_less_than_min_ratio)
        if self._max_ratio < aspect_ratio:
            raise ValidationError(self._message_greater_than_max_ratio)


class SketchForm(FlaskForm):
    TINY_IMAGE_WIDTH = 100
    SMALL_IMAGE_WIDTH = 768
    MEDIUM_IMAGE_WIDTH = 1920
    LARGE_IMAGE_WIDTH = 3840

    MAX_NAME_LENGTH = 40

    name = StringField(
        label="Название скетча",
        validators=[
            DataRequired(message="Название скетча не указано"),
            Length(
                max=MAX_NAME_LENGTH,
                message=f"Слишком длинное название "
                f"(максимум {MAX_NAME_LENGTH})",
            ),
        ],
    )
    image = ImageField(
        label="Изображение",
        validators=[FileRequired(message="Изображение не прикреплено")],
    )
    place = PlaceField(label="Место")
    submit = SubmitField(label="Продолжить")

    def _resize_with_aspect_ratio(
        self,
        width: int | float = ...,
        height: int | float = ...,
    ) -> PIL.Image.Image | None:
        image = self.pillow_image

        if image is None:
            return

        image_w, image_h = image.size
        aspect_ratio_wh = image_w / image_h
        aspect_ratio_hw = 1 / aspect_ratio_wh

        if (
            width != Ellipsis
            and height != Ellipsis
            and height / width != aspect_ratio_hw
        ):
            raise ValueError(
                "given width and height do not match image aspect ratio",
            )

        if width != Ellipsis:
            height = min(image_h, width * aspect_ratio_hw)

        if height != Ellipsis:
            width = min(image_w, height * aspect_ratio_wh)

        return image.resize((int(width), int(height)))

    @cached_property
    def pillow_image_tiny(self) -> PIL.Image.Image | None:
        return self._resize_with_aspect_ratio(
            width=self.TINY_IMAGE_WIDTH,
        )

    @cached_property
    def pillow_image_small(self) -> PIL.Image.Image | None:
        return self._resize_with_aspect_ratio(
            width=self.SMALL_IMAGE_WIDTH,
        )

    @cached_property
    def pillow_image_medium(self) -> PIL.Image.Image | None:
        return self._resize_with_aspect_ratio(
            width=self.MEDIUM_IMAGE_WIDTH,
        )

    @cached_property
    def pillow_image_large(self) -> PIL.Image.Image | None:
        return self._resize_with_aspect_ratio(
            width=self.LARGE_IMAGE_WIDTH,
        )

    @cached_property
    def pillow_image(self) -> PIL.Image.Image | None:
        try:
            image = PIL.Image.open(self.image.data)
        except (
            FileNotFoundError,
            PIL.UnidentifiedImageError,
            ValueError,
            TypeError,
        ):
            return

        if image.format is None:
            try:
                image.format = self.image.data.content_type.split("/")[1]
            except (AttributeError, IndexError):
                return

        return image

    @property
    def longitude(self) -> float | None:
        coordinates = utils.parse_coordinates(self.place.data)
        if coordinates:
            return coordinates[0]

    @property
    def latitude(self) -> float | None:
        coordinates = utils.parse_coordinates(self.place.data)
        if coordinates:
            return coordinates[0]

    def validate_image(self, _) -> None:
        validate_image_extension = ImageExtensionValidator(
            allowed_extensions=settings.ALLOWED_MEDIA_EXTENSIONS,
            message="Некорректный формат изображения",
        )
        validate_image_aspect_ratio = ImageAspectRatioValidator(
            min_ratio=0.95 / 1,
            message_less_than_min_ratio="Ширина изображения "
            "должна быть больше высоты",
        )

        validate_image_extension(self.pillow_image)
        validate_image_aspect_ratio(self.pillow_image)

    def validate_place(self, _) -> None:
        if not self.place.data:
            return

        lon, lat = self.longitude, self.latitude

        if (
            lon is None
            or lat is None
            or not (-180 <= lon <= 180)
            or not (-90 <= lat <= 90)
        ):
            raise ValidationError("Такого места не существует")
