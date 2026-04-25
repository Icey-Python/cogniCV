#!/bin/bash

# Select the app to update
echo "What app are you updating?"
echo "1: client"
echo "2: server"
echo "3: All apps"
read -p "Enter app number: " site

cd /var/www/cognicv.101software.site

# Run the deploy commands
if [[ $site == 1 ]]; then
  rm -rf client

  cp -r cognicv/client ./
  cp .env.local ./client

  cd client
  pnpm install
  pnpm run build

  pm2 delete cognicv-frontend # remove old instance
  pnpm run deploy # create new instance

  pm2 status
  pm2 save
cd /var/www/cognicv.101software.site
elif [[ $site == 2 ]]; then
  rm -rf server

  cp -r cognicv/server ./
  cp .env.server ./server/.env

  cd server
  pnpm install
  pnpm run build

  pm2 delete cognicv-backend # remove old instance
  pnpm run deploy # create new instance

  pm2 status
  pm2 save
cd /var/www/www.deripesa.com
elif [[ $site == 3 ]]; then
  # Update server
  rm -rf server

  cp -r cognicv/server ./
  cp .env.server ./server/.env

  cd server
  pnpm install
  pnpm run build

  pm2 delete cognicv-backend # remove old instance
  pnpm run deploy # create new instance

  pm2 status
  pm2 save
cd /var/www/cognicv.101software.site

  # Update client
  rm -rf client

  cp -r cognicv/client ./
  cp .env.local ./client

  cd client
  pnpm install
  pnpm run build

  pm2 delete cognicv-frontend # remove old instance
  pnpm run deploy # create new instance

  pm2 status
  pm2 save
cd /var/www/cognicv.101software.site
else
  echo "Invalid choice given"
  exit 1 # Exit if a wrong site has been selected
fi


echo "$site has been updated successfully"
