#!/bin/bash -x

# https://github.com/awslabs/aws-sam-local
# npm install -g aws-sam-local

# get command line parameter with command index:
# e.g.: ./sam-commands.sh 1
COMMAND=$1

# execute command index:
case $COMMAND in
1) 
sam local invoke 'VisualExpress' --t sam-template.yaml -e sam-health.json
;;
11) 
sam local invoke 'VisualExpress' --t sam-template.yaml -e sam-health.json -d 5858
;;
2) 
sam local invoke 'VisualExpress' --t sam-template.yaml -e sam-helloworld.json
;;
22) 
sam local invoke 'VisualExpress' --t sam-template.yaml -e sam-helloworld.json -d 5858
;;
3) 
sam local invoke 'VisualExpress' --t sam-template.yaml -e sam-loopback.json
;;
33) 
sam local invoke 'VisualExpress' --t sam-template.yaml -e sam-loopback.json -d 5858
;;
esac
