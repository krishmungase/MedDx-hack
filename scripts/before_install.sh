#!/bin/bash
if pm2 status | grep -q "meddx-backend"; then
  pm2 stop meddx-backend
  pm2 delete meddx-backend
fi
rm -rf /home/ec2-user/MedDx-hack/*
