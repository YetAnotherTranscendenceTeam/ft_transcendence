FROM yatt-modules:latest

WORKDIR /services/db-profiles/
COPY . .

RUN npm install --production

ENTRYPOINT [ "npm", "start" ]

EXPOSE 3000

HEALTHCHECK \
  --interval=30s \
  --timeout=5s \
  --retries=3 \
  --start-period=1s \
  --start-interval=5s  \
  CMD curl http://localhost:3000/ || exit 1
