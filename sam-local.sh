#!/bin/bash -x

# https://github.com/awslabs/aws-sam-local
# npm install -g aws-sam-local

# get command line parameter with command index:
# e.g.: ./sam-commands.sh 1
COMMAND=$1

# execution template:
BASEPATH=./sam-local-events
TEMPLATE=sam-local.yaml

# execute command index:
case $COMMAND in
1) 
sam local invoke 'VisualExpress' --t $TEMPLATE -e $BASEPATH/sam-health.json
;;
11) 
sam local invoke 'VisualExpress' --t $TEMPLATE -e $BASEPATH/sam-health.json -d 5858
;;
2) 
sam local invoke 'VisualExpress' --t $TEMPLATE -e $BASEPATH/sam-helloworld.json
;;
22) 
sam local invoke 'VisualExpress' --t $TEMPLATE -e $BASEPATH/sam-helloworld.json -d 5858
;;
3) 
sam local invoke 'VisualExpress' --t $TEMPLATE -e $BASEPATH/sam-loopback.json
;;
33) 
sam local invoke 'VisualExpress' --t $TEMPLATE -e $BASEPATH/sam-loopback.json -d 5858
;;
esac
