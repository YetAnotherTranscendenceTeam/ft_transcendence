FROM yatt-modules:latest AS builder

ARG BACKEND_URL
ARG WS_URL
ARG NODE_ENV=production

WORKDIR /services/frontend/
COPY . .

RUN npm install
RUN npm run build

FROM node:23.7-alpine3.20

RUN apk --no-cache add curl

RUN npm install --global serve

COPY --from=builder /services/frontend/build/ /build

ENTRYPOINT [ "serve", "-s", "build", "-l", "8080" ]

EXPOSE 8080

HEALTHCHECK \
  --interval=30s \
  --timeout=5s \
  --retries=3 \
  --start-period=1s \
  --start-interval=5s  \
  CMD curl http://localhost:8080/ || exit 1
