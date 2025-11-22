# AMSA - Backend

This repository has been built using Node.js.

If you do not have Node.js, then you have to download from the official website.

You can check if you've installed Node.js using `node -v` which should output your version.

We recommend to use Git Bash terminal if you're using Windows. 

## For Development

Clone the repo under `development` branch.

If you're developing this repo, then you will need a couple of things

1. Install nodemon globally by `npm i -g nodemon`
2. Make sure you have correct `nodemon.json` in your root directory (Contact admin if you don't)
3. Install all the packages by `npm i`
4. Make sure your IP address is on the Remote MySQL (Go to your MySQL database hosting website)
 
After these, you are ready to start developing.

Run the server by:
 
``nodemon server``

If you're successfully started the server and connected to the database, you will see the following output.

```
Username: amsamn_website_admin
Database: amsamn_website_db
Server Listening on Port: 3000
```

If the database is not connecting, then it could be that the database on the server (Digital Ocean) has turned off.
You can restart the server on Digital Ocean with logging in with info@amsa.mn's Google account and restart the server by typing the following in the console.

``sudo service mysql restart``

## For Production

For complete deployment instructions, see **[DEPLOYMENT.md](./DEPLOYMENT.md)**

### Quick Overview

**Automated (CI/CD):** Push to `master` branch triggers automatic deployment via GitLab pipeline

**Manual Deployment:**
```bash
# On production server
cd /root/amsa/amsa-backend
git pull origin master
npm ci
pm2 restart "AMSA Bac"
```

### Related Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment procedures
- [GitLab CI/CD Setup](./.gitlab-ci-setup.md) - Pipeline configuration
- [Frontend Deployment](../amsa-frontend/DEPLOYMENT.md) - Frontend deployment


