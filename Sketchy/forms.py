__all__ = (
    'LoginForm',
    'SketchForm'
)

from functools import cache

from flask_wtf import FlaskForm
from wtforms import StringField, PasswordField, SubmitField
from wtforms.validators import DataRequired, ValidationError
from flask_wtf.file import FileField, FileRequired, FileAllowed

from database import Session, User
from settings import ALLOWED_MEDIA_EXTENSIONS
from utils import is_existing_place


# class ImageAllowed(FileAllowed):
#
#     def __init__(self, upload_set=ALLOWED_MEDIA_EXTENSIONS, message=None):
#         upload_set = tuple(map(str.lower, upload_set))
#
#         super().__init__(upload_set, message)
#
#         mime_types = []
#         for allowed_type in upload_set:
#             if allowed_type.startswith('image/'):
#                 mime_type = allowed_type
#             else:
#                 mime_type = f'image/{allowed_type.lower()}'
#             mime_types.append(mime_type)
#         self.field_flags = {'accept': ', '.join(mime_types)}


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

    @staticmethod
    def validate_name(_, field):
        if len(field.data) > 40:
            raise ValidationError('Слишком длинное название (максимум 40)')

    @staticmethod
    def validate_image(_, field):
        if field.data.content_type.split('/')[1].upper() not in ALLOWED_MEDIA_EXTENSIONS:
            raise ValidationError('Неподдерживаемый тип файла')

    @staticmethod
    def validate_place(_, field):
        if field.data and not is_existing_place(field.data):
            raise ValidationError('Указанное место не найдено')
