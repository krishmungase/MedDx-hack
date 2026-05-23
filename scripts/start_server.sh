#!/bin/bash
cd /home/ec2-user/MedDx-hack/MedDx-backend

# Fetch the .env file from AWS Systems Manager Parameter Store
aws ssm get-parameter --name "/meddx/backend/env" --with-decryption --query "Parameter.Value" --output text > .env

pm2 start api/index.js --name "meddx-backend"
