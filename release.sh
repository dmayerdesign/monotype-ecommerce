#!/bin/bash
#################################################
#################################################

export RELEASE_VERSION="0.0.1";
RELEASE_MESSAGE="First release";

#################################################
#################################################

export RELEASE_MESSAGE="v$RELEASE_VERSION - $RELEASE_MESSAGE";
git tag -a v$RELEASE_VERSION -m "$RELEASE_MESSAGE";


../deploy.sh