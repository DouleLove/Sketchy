from . import app
from .database import User, Session


@app.route('/')
def test_view():  # test view, should be removed or changed in future updates
    session = Session()
    user = User()
    user.name = 'kfjgdkfjg'
    session.add(user)
    session.commit()

    return 'Пользователь сохранен'
