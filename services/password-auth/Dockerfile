FROM node:23.7-alpine3.20

WORKDIR /services/password-auth/
COPY . .

RUN npm install --production

ENTRYPOINT [ "node",  "srcs/index.js" ]

EXPOSE 3000