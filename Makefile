PLATFORM=linux/amd64
DOCKER_REGISTRY=jparkkennaby
IMAGE_NAME=graphql-editor
DOCKER_IMAGE=$(DOCKER_REGISTRY)/$(IMAGE_NAME)

dev:
	npm run dev

# --platform $(PLATFORM)
docker-build:
	docker build \
	 -t ${DOCKER_IMAGE} \
	 .

docker-run:
	docker run -it \
	-p 8080:8080 \
	-e VITE_API_URL=http://localhost:9092 \
	${DOCKER_IMAGE}

docker-debug:
	docker run -it \
	-p 8080:8080 \
	-e VITE_API_URL=http://localhost:9092 \
	${DOCKER_IMAGE} /bin/bash

docker-tag:
	docker tag ${DOCKER_IMAGE} ${DOCKER_IMAGE}:latest

docker-push:
	docker push ${DOCKER_IMAGE}:latest
