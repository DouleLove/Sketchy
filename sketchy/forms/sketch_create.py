__all__ = ("SketchForm",)

from http import HTTPStatus
from typing import Any

import requests
from flask_wtf import FlaskForm
from flask_wtf.file import FileField, FileRequired
from wtforms import StringField, SubmitField
from wtforms.validators import DataRequired, Length, ValidationError

import sketchy.settings as settings


class SketchForm(FlaskForm):
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
    place = StringField(
        label="Место", validators=[DataRequired(message="Место не указано")]
    )
    image = FileField(
        label="Изображение",
        validators=[FileRequired(message="Изображение не прикреплено")],
    )
    submit = SubmitField(
        label="Продолжить",
    )

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)

    @staticmethod
    def validate_image(_, field: FileField) -> None:
        ext = field.data.content_type.split("/")[1].upper()
        if ext not in settings.ALLOWED_MEDIA_EXTENSIONS:
            raise ValidationError("Неподдерживаемый тип файла")

    def validate_place(self, field: StringField) -> None:
        if field.data and not self._check_place_exists(field.data):
            raise ValidationError("Указанное место не найдено")

    @staticmethod
    def _check_place_exists(place: str) -> bool:
        url = "http://geocode-maps.yandex.ru/1.x/"
        params = {
            "apikey": settings.APIKEY_GEOCODER,
            "geocode": place,
            "format": "json",
        }

        response = requests.get(url, params=params)

        print(response.json())
        if response.status_code == HTTPStatus.OK:
            return bool(
                int(
                    response.json()
                    .get("response")
                    .get("GeoObjectCollection")
                    .get("metaDataProperty")
                    .get("GeocoderResponseMetaData")
                    .get("found")
                )
            )

        return False
