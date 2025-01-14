__all__ = ("LoginForm",)

from functools import cached_property
from typing import Any

from flask_wtf import FlaskForm
from wtforms.fields.simple import PasswordField, StringField, SubmitField
from wtforms.validators import DataRequired, Length, ValidationError

from sketchy.database import User


class LoginForm(FlaskForm):
    MAX_LOGIN_LENGTH = 20

    login = StringField(
        label="Логин",
        validators=[
            DataRequired(message="Логин не указан"),
            Length(
                max=MAX_LOGIN_LENGTH,
                message=f"Слишком длинный логин (максимум {MAX_LOGIN_LENGTH})",
            ),
        ],
    )
    password = PasswordField(
        label="Пароль",
        validators=[DataRequired(message="Пароль не указан")],
    )
    submit = SubmitField(
        label="Продолжить",
    )

    def __init__(self, new: bool, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, **kwargs)

        # boolean value which expected to be passed from auth view
        # (?n=true means new user (True) in url or "n" parameter is missing,
        # which means existing user (False))
        self._new = new

    @cached_property
    def user_by_login(self) -> User:
        return User.get(login=self.login.data)

    def validate_login(self, _) -> None:
        if self._new:
            if self.user_by_login:
                raise ValidationError("Этот логин уже занят")
            return  # validation passed, ready to create new user

        if not self.user_by_login:
            raise ValidationError("Пользователь не найден")

    def validate_password(self, _) -> None:
        if (
            not self._new
            and self.user_by_login
            and not self.user_by_login.check_password(self.password.data)
        ):
            raise ValidationError("Неверный пароль")
