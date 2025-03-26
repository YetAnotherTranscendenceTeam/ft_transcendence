FROM yatt-modules:latest

RUN apk --no-cache add curl

HEALTHCHECK \
  --interval=30s \
  --timeout=5s \
  --retries=3 \
  --start-period=1s \
  --start-interval=5s  \
  CMD curl http://localhost:8080/ || exit 1

WORKDIR /services/frontend/
COPY . .

ARG BACKEND_URL
ARG WS_URL

RUN npm install
RUN npm install --global serve
RUN npm run build

ENTRYPOINT [ "serve", "build", "-l", "8080" ]

EXPOSE 8080
