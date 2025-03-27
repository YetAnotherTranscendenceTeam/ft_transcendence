FROM node:23.7-alpine3.20

WORKDIR /services/google-auth/
COPY . .

RUN npm install

ENTRYPOINT npm start

EXPOSE 3000
