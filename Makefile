override SERVICES = \
	credentials \
	fortytwo-auth \
	password-auth \
	registration \
	token-manager \

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

SERVICES_DEPS = $(patsubst %, services/%/node_modules, $(SERVICES))
MODULES_DEPS = $(patsubst %, modules/%/node_modules, $(MODULES))
TS_MODULES_DEPS = $(patsubst %, modules/%/node_modules, $(TS_MODULES))

override SSL_CERTIFICATE = secrets/localhost.crt secrets/localhost.key

all: $(MODULES_DEPS) $(TS_MODULES_DEPS) $(SSL_CERTIFICATE)

dev: $(SERVICES_DEPS)

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
ifeq ($(ENV),production)
	$(error Tests cannot be run in production environment)
else
	npm --prefix ./tests run test
endif

clean-modules:
	rm -rf $(patsubst %, modules/%/node_modules, $(MODULES))
	rm -rf $(patsubst %, modules/%/node_modules, $(TS_MODULES))
	rm -rf $(patsubst %, modules/%/dist, $(TS_MODULES))

clean-services:
	rm -rf $(patsubst %, services/%/node_modules, $(SERVICES))

clean-db:
	rm $$HOME/goinfre/docker/volumes/ft_transcendence_sqlite/_data/*

fclean:
	$(MAKE) clean-modules
	$(MAKE) clean-services
	$(MAKE) clean-db
