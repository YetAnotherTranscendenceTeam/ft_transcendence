FROM node:23.7-alpine3.20

RUN apk --no-cache add curl

HEALTHCHECK --interval=30s --timeout=5s --start-period=1s --start-interval=5s  --retries=3 \
  CMD curl http://localhost:3000/ || exit 1

WORKDIR /services/documentation/
COPY package*.json .

RUN npm install -g nodemon
RUN npm install


ENTRYPOINT [ "nodemon", "--ext", "js,yaml", "--watch", "./srcs", "--watch", "/documentation", "srcs/index.js" ]

EXPOSE 3000
