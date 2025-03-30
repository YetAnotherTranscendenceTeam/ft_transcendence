FROM nginx:1.26.3-alpine

RUN apk --no-cache add curl

ARG CDN_AUTOINDEX=off

COPY ./shared/* /tmp/conf/

RUN for file in /tmp/conf/*; do \
    envsubst < "$file" > "/etc/nginx/$(basename "$file")"; \
done && rm -rf /tmp/conf

ARG CONF_FILE=default.conf

COPY ./conf/${CONF_FILE} /etc/nginx/templates/default.conf.template

HEALTHCHECK \
  --interval=30s \
  --timeout=5s \
  --retries=3 \
  --start-period=1s \
  --start-interval=5s \
  CMD curl http://localhost:8181/ping || exit 1
