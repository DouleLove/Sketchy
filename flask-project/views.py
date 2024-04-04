from flask import Blueprint, redirect, render_template, url_for
# from database import User, Session
from random import randint

blueprint = Blueprint(
    'views',
    __name__,
    template_folder='templates'
)


@blueprint.route('/')
def test_view():  # test view, should be removed or changed in future updates
    # session = Session()
    # user = User()
    # user.name = 'kfjgdkfjg'
    # session.add(user)
    # session.commit()

    return 'Пользователь сохранен'


@blueprint.route('/sketch/')
@blueprint.route('/sketch/<int:sketch_id>')
def sketch_view(sketch_id=None):
    if not sketch_id:
        return redirect(f'{randint(0, 12)}')  # пока так
    else:
        return str(sketch_id)
