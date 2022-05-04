FROM node:alpine as base

RUN mkdir node

COPY . /node

WORKDIR /node/

RUN npm install

CMD npm start