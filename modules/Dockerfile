FROM node:23.7-alpine3.20

RUN apk --no-cache add curl

WORKDIR /modules
COPY . .

RUN (cd ./yatt-utils && npm i)
RUN (cd ./yatt-ws && npm i)
RUN (cd ./yatt-sse && npm i)

RUN (cd ./babact && npm i && npm run build)
RUN (cd ./babact-router-dom && npm i && npm run build)
RUN (cd ./yatt-lobbies && npm i && npm run build)