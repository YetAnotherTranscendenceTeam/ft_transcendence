ARG BASE_IMAGE=yatt-modules:latest

FROM $BASE_IMAGE

WORKDIR /services/lobbies/
COPY . .

RUN npm install --omit=dev

ENTRYPOINT [ "npm", "start" ]

EXPOSE 3000

HEALTHCHECK \
  --interval=30s \
  --timeout=5s \
  --retries=3 \
  --start-period=1s \
  --start-interval=5s  \
  CMD curl http://localhost:3000/ || exit 1
