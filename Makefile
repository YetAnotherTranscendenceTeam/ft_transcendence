
override SERVICES = \
	credentials \
	fortytwo-auth \
	password-auth \
	registration \
	token-manager \

override MODULES = \
	yatt-utils

SERVICES_DEPS = $(patsubst %, services/%/node_modules, $(SERVICES))
MODULES_DEPS = $(patsubst %, modules/%/node_modules, $(MODULES))

override SSL_CERTIFICATE = secrets/localhost.crt secrets/localhost.key

all: $(SERVICES_DEPS) $(MODULES_DEPS) $(SSL_CERTIFICATE)

$(MODULES_DEPS) $(SERVICES_DEPS):
	(cd $(@D) && npm i)

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
	rm -rf $(patsubst %, services/%/node_modules, $(SERVICES))
