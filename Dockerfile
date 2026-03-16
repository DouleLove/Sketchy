FROM python:3

ENV PYTHONUNBUFFERED=1

WORKDIR /Sketchy

COPY . ./

RUN pip install --no-cache-dir -r requirements/production.txt

CMD ["gunicorn", "sketchy.__main__.py:sketchy"]
