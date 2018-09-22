#!/bin/bash

mte() {
    echo "$1";
    if [ "$1" = "dev" ]; then
        mte dev:app &
        mte dev:server;
    fi
    if [ "$1" = "prebuild" ]; then
        node ./build-utils/mte-client.prebuild
    fi
    if [ "$1" = "prebuild:api" ]; then
        node ./build-utils/mte-api.prebuild
    fi
    if [ "$1" = "dev:app" ]; then
        mte prebuild:app && \
        ng build \
            --watch \
            --aot=true && \
        ng build \
            --watch \
            --app mte-client-universal
    fi
    if [ "$1" = "dev:server" ]; then
        mte build:server; nodemon dist/server.js & mte watch:server;
    fi
    if [ "$1" = "build" ]; then
        mte clean; mte build:app && mte build:server
    fi
    if [ "$1" = "build:staging" ]; then
        mte clean; npm i; mte build:staging-app && mte build:server
    fi
    if [ "$1" = "build:prod" ]; then
        mte clean; npm i; mte build:prod-app && mte build:server
    fi
    if [ "$1" = "build:app" ]; then
        mte prebuild:app && ng build && ng build --app mte-client-universal
    fi
    if [ "$1" = "build:staging-app" ]; then
        npm i
        mte prebuild:app && \
        ng build \
            --prod \
            --environment=staging && \
        ng build \
            --app mte-client-universal \
            --prod \
            --environment=staging
    fi
    if [ "$1" = "build:prod-app" ]; then
        mte prebuild:app && \
        ng build \
            --prod \
            --environment=prod && \
        ng build \
            --prod \
            --aot=false \
            --environment=prod \
            --app mte-client-universal
    fi
    if [ "$1" = "build:server" ]; then
        mte prebuild:api && webpack --config mte-api/config/webpack.server-config.js
    fi
    if [ "$1" = "watch:server" ]; then
        webpack --config mte-api/config/webpack.server-config.js --watch
    fi
    if [ "$1" = "start:local" ]; then
        node dist/server
    fi
}

mte $1 $2
