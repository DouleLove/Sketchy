__all__ = (
    "auth_view_get_handler",
    "auth_view_post_handler",
)

from flask import Response, g, redirect, render_template, request
from flask_login import current_user, login_user

from sketchy.database import User
from sketchy.forms import LoginForm


def auth_view_get_handler() -> Response | tuple[User | None, LoginForm]:
    if current_user.is_authenticated:
        return redirect("/profile")

    form = LoginForm(new=bool(request.args.get("n")))

    # validation failed or form just created
    if (user := form.validate_on_submit()) is False:
        if request.args.get("n") is None:
            form_template = "signin-form.html"
        else:
            form_template = "signup-form.html"

        return Response(
            render_template(template_name_or_list=form_template, form=form)
        )

    return user, form


def auth_view_post_handler(user: User, form: LoginForm) -> Response:
    if user is None:
        session = g.session
        user = User()
        user.login = form.login.data
        user.password = form.password.data
        session.add(user)
        session.commit()
    login_user(user, remember=True)

    return redirect(request.args.get("referrer", "/profile"))
