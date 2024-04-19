__all__ = (
    'LoginForm',
    'SketchForm'
)

from functools import cache

from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, ValidationError
from flask_wtf.file import FileField, FileRequired

from database import Session, User
from settings import ALLOWED_MEDIA_EXTENSIONS
from utils import is_existing_place


class LoginForm(FlaskForm):
    login = StringField('Логин', validators=[DataRequired(message='Логин не указан')])
    password = PasswordField('Пароль', validators=[DataRequired(message='Пароль не указан')])
    submit = SubmitField('Продолжить')

    def __init__(self, new, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # boolean value which expected to be passed from auth view
        # (?n=true means new user (True) in url or "n" parameter is missing, which means existing user (False))
        self._new = new

    @cache
    def _get_user(self):
        session = Session()
        user = session.query(User).filter(User.unique_name == self.login.data).first()

        return user

    def validate_login(self, field):
        if self._new:
            if self._get_user():
                raise ValidationError('Этот логин уже занят')
            if len(field.data) > 20:
                raise ValidationError('Слишком длинный логин (максимум 20)')
            return  # validation passed, ready to create new user

        if not self._get_user():
            raise ValidationError('Пользователь не найден')

    def validate_password(self, field):
        if not self._new and self._get_user() and not self._get_user().check_password(field.data):
            raise ValidationError('Неверный пароль')

    def validate_on_submit(self, extra_validators=None):
        return self._get_user() if super().validate_on_submit(extra_validators=extra_validators) else False


class SketchForm(FlaskForm):
    name = StringField('Название скетча', validators=[DataRequired(message='Название скетча не указано')])
    place = StringField('Место')
    image = FileField('Изображение', validators=[FileRequired(message='Изображение не прикреплено')])
    submit = SubmitField('Продолжить')

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)

    def validate_image(self, _):
        if self.image.data.content_type.split('/')[1].upper() not in ALLOWED_MEDIA_EXTENSIONS:
            raise ValidationError('Неподдерживаемый тип файла')

    def validate_place(self, _):
        if self.place.data and not is_existing_place(self.place.data):
            raise ValidationError('Указанное место не найдено')
