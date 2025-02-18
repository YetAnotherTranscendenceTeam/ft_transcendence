SSL_CERTIFICATE = secrets/localhost.crt secrets/localhost.key

MODULES = yatt-utils
MODULES_DEPENDENCIES = $(patsubst %, modules/%/node_modules, $(MODULES))

all: $(MODULES_DEPENDENCIES) $(SSL_CERTIFICATE)

deps: $(MODULES_DEPENDENCIES)

$(MODULES_DEPENDENCIES) :
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
