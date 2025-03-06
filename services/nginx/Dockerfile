FROM nginx:1.26.3-alpine

HEALTHCHECK --interval=10s --timeout=5s --start-period=1s --start-interval=2s --retries=3  \
  CMD curl http://localhost:8080/ && curl http://localhost:7979/ || exit 1

COPY ./conf/default.conf.template /etc/nginx/templates/