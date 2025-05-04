PLATFORM=linux/amd64
DOCKER_REGISTRY=jparkkennaby
IMAGE_NAME=graphql-faker-editor
DOCKER_IMAGE=$(DOCKER_REGISTRY)/$(IMAGE_NAME)

dev:
	npm run dev

build:
	npm run build

# serve is a custom npm command:
# uses an entrypoint to handle run time env vars and path limitations (see entrypoint.js file)
# must build the project first
serve-js:
	IGNORE_PATHS="" \
	VITE_API_URL=localhost:3000 \
	npm run serve:js

serve-bash:
	IGNORE_PATHS="" \
	VITE_API_URL=localhost:3000 \
	npm run serve:bash

# --platform $(PLATFORM)
docker-build:
	docker build \
	 -t ${DOCKER_IMAGE} \
	 .

docker-run:
	docker run -it \
	-p 5173:5173 \
	-e VITE_API_URL=http://localhost:3000 \
	-e IGNORE_PATHS="" \
	${DOCKER_IMAGE}

docker-debug:
	docker run -it \
	-p 5173:5173 \
	-e VITE_API_URL=http://localhost:3000 \
	${DOCKER_IMAGE} /bin/bash

docker-tag:
	docker tag ${DOCKER_IMAGE} ${DOCKER_IMAGE}:latest

docker-push:
	docker push ${DOCKER_IMAGE}:latest

# start the server (used for developing the front end)
# https://github.com/joepk90/graphql-faker
docker-run-server:
	docker run -it \
	-e ALLOWED_HOSTS=http://localhost:5173 \
	-e PORT=3000 \
	-e SCHEMA_FILE_NAME=schema_extension \
	-e USTOM_HEADERS=user-agent,authorization \
	-e EXTEND_URL=https://swapi-graphql.netlify.app/graphql \
	jparkkennaby/graphql-faker

# Future TODO: rename the image (jparkkennaby/graphql-faker-server)
# Future TODO: remove SCHEMA_FILE_NAME and port (potentially share a volume for the SCHEMA_FILE_NAME)