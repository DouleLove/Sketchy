__all__ = (
    'lazy_loader',
    'get_session',
    'is_alive'
)

import sqlalchemy.orm as orm


def get_session(instance):
    return orm.Session.object_session(instance)


def is_alive(instance):
    sess = orm.Session.object_session(instance)
    state = sess and sess.is_active and not sess.dirty and not sess.deleted and not sess.new

    return state


def lazy_loader(fn):
    cached = {}

    def _wrapper(*args, **kwargs):
        key = f'{args}{kwargs}'

        if not cached.get(key) or not is_alive(cached[key]):
            cached[key] = fn(*args, **kwargs)
        return cached[key]

    return _wrapper
