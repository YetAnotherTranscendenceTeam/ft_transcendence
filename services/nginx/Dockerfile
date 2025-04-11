FROM nginx:1.26.3-alpine

COPY ./shared/* /etc/nginx/

ARG CONF_FILE=default.conf

COPY ./conf/${CONF_FILE} /etc/nginx/templates/default.conf.template

HEALTHCHECK \
  --interval=30s \
  --timeout=5s \
  --retries=3  \
  --start-period=1s \
  --start-interval=5s \
  CMD (curl http://localhost:8080/ping && curl http://localhost:7979/ping) || exit 1
