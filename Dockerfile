FROM python:3

ENV PYTHONUNBUFFERED=1

WORKDIR /Sketchy

COPY . ./

RUN pip install --no-cache-dir -r requirements/production.txt

CMD ["sh", "-c", "waitress-serve --host=0.0.0.0 --port=8000 sketchy.__main__:sketchy"]
