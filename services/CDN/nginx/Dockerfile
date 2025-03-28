FROM nginx:1.26.3-alpine

RUN apk --no-cache add curl

COPY ./shared/* /etc/nginx/
COPY ./conf/default.conf.template /etc/nginx/templates/

HEALTHCHECK \
  --interval=30s \
  --timeout=5s \
  --retries=3 \
  --start-period=1s \
  --start-interval=5s \
  CMD curl http://localhost:8181/ping || exit 1
