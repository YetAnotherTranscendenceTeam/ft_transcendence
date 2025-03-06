FROM nginx:1.26.3-alpine

RUN apk --no-cache add curl

HEALTHCHECK --interval=10s --timeout=5s --start-period=1s --start-interval=2s --retries=3  \
  CMD curl http://localhost:8181/ || exit 1

COPY ./conf/default.conf.template /etc/nginx/templates/
