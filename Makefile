override SERVICES = \
	credentials \
	fortytwo-auth \
	password-auth \
	registration \
	token-manager \
	2fa \

override MODULES = \
	yatt-utils \
	yatt-ws \
	yatt-sse \
	yatt-jwt \

override TS_MODULES = \
	babact \
	babact-router-dom \
	yatt-lobbies \
	physics-engine \
	pong \

override SERVICES_DEPS = $(patsubst %, services/%/node_modules, $(SERVICES))
override MODULES_DEPS = $(patsubst %, modules/%/node_modules, $(MODULES))
override TS_MODULES_DEPS = $(patsubst %, modules/%/node_modules, $(TS_MODULES))

override SSL_CERTIFICATE = secrets/localhost.crt secrets/localhost.key

dev: $(MODULES_DEPS) $(TS_MODULES_DEPS) $(SSL_CERTIFICATE)
	./env-generator.sh evaluation
	docker compose up -d --build --wait

$(MODULES_DEPS) $(SERVICES_DEPS):
	(cd $(@D) && npm i)

$(TS_MODULES_DEPS) :
	(cd $(@D) && npm i && npm run build)

$(SSL_CERTIFICATE):
	mkdir -p $(@D)
	openssl req -newkey rsa:4096 \
		-x509 \
		-sha256 \
		-days 3650 \
		-nodes \
		-out secrets/localhost.crt \
		-keyout secrets/localhost.key \
		-subj "/C=FR/ST=Rhone-Alpes/L=Lyon/O=YATT/OU=IT Department/CN=www.localhost.com"

test:
	(cd ./tests && npm i)
	npm --prefix ./tests run test

evaluation:
	./env-generator.sh evaluation
	(cd modules && docker compose build)
	docker compose -f docker-compose.yaml -f docker-compose.eval.yaml up -d --build --wait

services-modules: $(SERVICES_DEPS)

clean-modules:
	-rm -rf $(patsubst %, modules/%/node_modules, $(MODULES))
	-rm -rf $(patsubst %, modules/%/node_modules, $(TS_MODULES))
	-rm -rf $(patsubst %, modules/%/dist, $(TS_MODULES))

clean-services:
	-rm -rf $(patsubst %, services/%/node_modules, $(SERVICES))

clean-db:
	-rm $$HOME/goinfre/docker/volumes/ft_transcendence_sqlite/_data/*

fclean:
	$(MAKE) clean-modules
	$(MAKE) clean-services
	$(MAKE) clean-db

re:
	docker compose down
	$(MAKE) fclean
	$(MAKE) dev
