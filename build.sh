#!/bin/bash

mte() {
    echo "$1";
    if [ "$1" = "dev" ]; then
        mte dev:app &
        mte dev:server;
    fi
    if [ "$1" = "dev:app" ]; then
        ng build \
            --watch \
            --aot=true && \
        ng build mte-client-universal \
            --watch
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
        ng build && ng build mte-client-universal
    fi
    if [ "$1" = "build:staging-app" ]; then
        npm i && \
        ng build \
            --prod \
            --environment=staging && \
        ng build mte-client-universal \
            --prod \
            --environment=staging
    fi
    if [ "$1" = "build:prod-app" ]; then
        npm i && \
        ng build \
            --prod \
            --environment=prod && \
        ng build mte-client-universal \
            --prod \
            --aot=false \
            --environment=prod
    fi
    if [ "$1" = "build:server" ]; then
        webpack --config mte-api/config/webpack.server-config.js
    fi
    if [ "$1" = "watch:server" ]; then
        webpack --config mte-api/config/webpack.server-config.js --watch
    fi
    if [ "$1" = "start:local" ]; then
        node dist/server
    fi
    if [ "$1" = "clean" ]; then
        rimraf ./dist; mkdir -p dist/public
    fi
}

mte $1 $2
