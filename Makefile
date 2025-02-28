
override SERVICES = \
	credentials \
	fortytwo-auth \
	password-auth \
	registration \
	token-manager \

override MODULES = \
	yatt-utils \

override TS_MODULES = \
	babact \
	babact-router-dom \

SERVICES_DEPS = $(patsubst %, services/%/node_modules, $(SERVICES))
MODULES_DEPS = $(patsubst %, modules/%/node_modules, $(MODULES))
TS_MODULES_DEPS = $(patsubst %, modules/%/node_modules, $(TS_MODULES))

override SSL_CERTIFICATE = secrets/localhost.crt secrets/localhost.key

all: $(SERVICES_DEPS) $(MODULES_DEPS) $(TS_MODULES_DEPS) $(SSL_CERTIFICATE)

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

fclean:
	rm -rf $(patsubst %, modules/%/node_modules, $(MODULES))
	rm -rf $(patsubst %, modules/%/node_modules, $(TS_MODULES))
	rm -rf $(patsubst %, modules/%/dist, $(TS_MODULES))
	rm -rf $(patsubst %, services/%/node_modules, $(SERVICES))
