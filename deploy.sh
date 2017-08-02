#!/bin/bash
#################################################
#################################################

DEPLOY_MESSAGE="First deploy";
export ENVIRONMENT="STAGE";

#################################################
#################################################

npm run build:prod || exit;

cd ..;
# echo "git add";
git add .;

if [ -z "$RELEASE_MESSAGE" ]
then
	git commit -m "$DEPLOY_MESSAGE";
else
	git commit -m "$RELEASE_MESSAGE";
fi

# echo "git push";
git push;
cd time-client-deploy;
# echo "git add (time-client-deploy)";
git add .;
# echo "git commit (time-client-deploy)";

if [ -z "$RELEASE_MESSAGE" ]
then
	git commit -m "$DEPLOY_MESSAGE";
else
	git commit -m "$RELEASE_MESSAGE";
fi

# echo "git push (time-client-deploy)";
git push;
# echo "Deploying to Heroku";
git push heroku master;
# echo "cd ../time-client";
cd ../time-client;

exit;
