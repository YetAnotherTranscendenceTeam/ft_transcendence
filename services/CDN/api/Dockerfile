FROM node:23.7-alpine3.20

WORKDIR /services/CDN/api/
COPY . .

RUN npm install

ENTRYPOINT [ "node",  "srcs/index.js" ]

EXPOSE 3000
