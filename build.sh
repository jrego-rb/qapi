#!/bin/bash

IMG="docker.dev.redbee.io/qapi:$(git describe --abbrev=0 --tags 2>/dev/null || echo 'latest')"

echo "Building $IMG"
docker build -t "$IMG" . && \
docker push "$IMG"
