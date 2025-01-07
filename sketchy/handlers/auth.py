__all__ = (
    "auth_view_get_handler",
    "auth_view_post_handler",
)

from flask import Response, g, redirect, render_template, request
from flask_login import current_user, login_user

from sketchy.database import User
from sketchy.forms import LoginForm


def auth_view_get_handler() -> Response | LoginForm:
    if current_user.is_authenticated:
        return redirect("/profile")

    form = LoginForm(new=bool(request.args.get("n")))

    # validation succeed, pass form to auth_view_post_handler()
    if form.validate_on_submit():
        return form

    if request.args.get("n") is None:
        form_template = "signin-form.html"
    else:
        form_template = "signup-form.html"

    return Response(
        render_template(template_name_or_list=form_template, form=form),
    )


def auth_view_post_handler(form: LoginForm) -> Response:
    user = form.user_by_login
    if user is None:
        user = User()
        user.login = form.login.data
        user.password = form.password.data
        g.session.add(user)
        g.session.commit()

    login_user(user, remember=True)

    print(request.args.get('referrer'))
    return redirect(request.args.get("referrer", "/profile"))
