FROM ubuntu
FROM node:17

WORKDIR /usr/src/app

ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update && \
    apt-get -y install gcc mono-mcs && \
    rm -rf /var/lib/apt/lists/* && \
    apt-get -y install python3

RUN apt update -y && apt-get install -y software-properties-common && \
    apt-add-repository 'deb http://security.debian.org/debian-security stretch/updates main' && apt-get update -y && \
    apt-get install -y openjdk-8-jdk-headless && \
    apt-get clean
ENV java /usr/lib/jvm/java-8-openjdk-amd64/
RUN export java

COPY package*.json ./

RUN npm install


COPY . .

EXPOSE 8080
CMD ["npm","run","start"]
