FROM ubuntu
FROM node:17

WORKDIR /usr/src/app

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && \
    apt-get -y install gcc mono-mcs && \
    rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install


COPY . .

EXPOSE 8080
CMD ["npm","run","start"]
