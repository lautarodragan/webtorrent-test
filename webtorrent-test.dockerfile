FROM node:8.1.4

RUN apt-get update && apt-get install -y --no-install-recommends xvfb libgtk2.0-0 libxtst-dev libxss-dev libgconf2-dev libnss3 libasound2-dev

COPY . /webtorrent

WORKDIR /webtorrent

CMD [ "node", "seeder.js", "file.txt" ]