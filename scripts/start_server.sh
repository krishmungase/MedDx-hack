#!/bin/bash
set -e
cd /home/ec2-user/MedDx-hack/MedDx-backend

# Fetch the .env file from AWS Systems Manager Parameter Store
aws ssm get-parameter --name "/meddx/backend/env" --with-decryption --query "Parameter.Value" --output text > .env

pm2 start api/index.js --name "meddx-backend"

# Wait a few seconds to see if it crashes
sleep 3

# Check if it is online. If it crashed, exit with error
if ! pm2 status | grep "meddx-backend" | grep -q "online"; then
  echo "Backend crashed after starting! Check PM2 logs."
  pm2 logs meddx-backend --lines 20
  exit 1
fi
