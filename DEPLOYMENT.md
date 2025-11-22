# AMSA Backend - Deployment Guide

Complete guide for deploying the AMSA backend API to production.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Automated Deployment (CI/CD)](#automated-deployment-cicd)
- [Manual Deployment](#manual-deployment)
- [Environment Configuration](#environment-configuration)
- [CORS Configuration](#cors-configuration)
- [Database Management](#database-management)
- [Troubleshooting](#troubleshooting)
- [Rollback Procedures](#rollback-procedures)

---

## Prerequisites

### Local Development
- Node.js v18 or higher
- npm v9 or higher
- Git access to repository
- MySQL database access

### Production Server
- VM/Server with SSH access
- PM2 installed globally
- Node.js v18 or higher
- MySQL database running
- Git configured with SSH keys

---

## Automated Deployment (CI/CD)

The backend uses GitLab CI/CD for automated deployments.

### How It Works

On every push to `master` branch:
1. GitLab runner connects to VM via SSH
2. Pulls latest code from repository
3. Installs dependencies with `npm install`
4. Restarts PM2 process
5. Saves PM2 configuration

### GitLab CI/CD Variables

**Required variables** in **Settings → CI/CD → Variables**:

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `SSH_PRIVATE_KEY` | VM SSH private key | `-----BEGIN OPENSSH...` | ✅ Yes |
| `VM_USER` | SSH username | `root` | ✅ Yes |
| `VM_HOST` | VM hostname/IP | `backend.amsa.mn` or IP | ✅ Yes |
| `DEPLOY_PATH` | Backend directory path | `/root/amsa/amsa-backend` | ⚠️ Optional* |

**\*Note:** `DEPLOY_PATH` is optional. If not set, it defaults to `/root/amsa/amsa-backend`

### Setting Up CI/CD Variables

1. Go to **GitLab → Settings → CI/CD → Variables**
2. Click **Add variable** for the **3 required variables** above
3. Set **Protected** flag for sensitive values
4. Set **Masked** flag for `SSH_PRIVATE_KEY`
5. Only add `DEPLOY_PATH` if your backend path is different from `/root/amsa/amsa-backend`

### Pipeline Configuration

Pipeline is defined in `.gitlab-ci.yml`:
```yaml
stages:
  - deploy

prod-deploy:
  stage: deploy
  rules:
    - if: '$CI_COMMIT_BRANCH == "master"'
```

### Monitoring Pipeline

1. Go to **CI/CD → Pipelines** in GitLab
2. View pipeline status (success/failed)
3. Check logs for detailed execution steps
4. Re-run failed pipelines if needed

---

## Manual Deployment

For emergency deployments or when CI/CD is unavailable.

### Step 1: SSH into VM

```bash
ssh user@your-vm-host
```

### Step 2: Navigate to Project Directory

```bash
cd /root/amsa/amsa-backend
# Or your configured DEPLOY_PATH
```

### Step 3: Pull Latest Changes

```bash
git fetch --all --prune
git reset --hard origin/master
git clean -fdx
```

### Step 4: Install Dependencies

```bash
npm install
```

### Step 5: Restart PM2

```bash
pm2 restart "AMSA Bac"
# or if not running
pm2 start server.js --name "AMSA Bac"

# Save PM2 configuration
pm2 save
```

### Step 6: Verify Deployment

```bash
# Check PM2 status
pm2 list

# View logs
pm2 logs "AMSA Bac" --lines 50

# Check if API is responding
curl http://localhost:3000/api/home
```

---

## Environment Configuration

### Environment Variables

The backend requires a `.env` file (or environment variables) on the production server:

**Location:** `/root/amsa/amsa-backend/.env`

```bash
# Database
AMSA_MYSQL_USER=your_mysql_user
AMSA_MYSQL_PASSWORD=your_mysql_password
AMSA_MYSQL_DATABASE=amsa_database
AMSA_MYSQL_HOST=localhost

# Server
AMSA_BACKEND_PORT=3000
NODE_ENV=production

# JWT
JWT_SECRET=your_jwt_secret_key

# Email (if using)
MAILJET_API_KEY=your_mailjet_api_key
MAILJET_SECRET_KEY=your_mailjet_secret_key
```

### PM2 Configuration

Located in `/root/ecosystem.config.js` (on VM):

```javascript
module.exports = {
  apps: [{
    name: 'AMSA Backend',
    script: 'server.js',
    cwd: '/root/amsa/amsa-backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production'
    }
  }]
}
```

---

## CORS Configuration

The backend has CORS configured to allow requests from the frontend.

### Allowed Origins

Located in `app.js` (lines 58-82):

```javascript
const allowedOrigins = [
  'https://amsa.mn',
  'http://localhost:4200',
  'http://localhost:3000'
];
```

### Adding New Origins

If you need to add a new origin:

1. Edit `app.js`
2. Add the origin to `allowedOrigins` array
3. Commit and push changes
4. Pipeline will auto-deploy, or restart manually

### Testing CORS

```bash
# Test CORS headers
curl -I -X OPTIONS https://backend.amsa.mn/api/home \
  -H "Origin: https://amsa.mn" \
  -H "Access-Control-Request-Method: GET"

# Should see: Access-Control-Allow-Origin: https://amsa.mn
```

---

## Database Management

### Database Connection

Ensure MySQL is running:

```bash
# Check MySQL status
sudo systemctl status mysql

# Restart if needed
sudo systemctl restart mysql

# Test connection
mysql -u your_user -p
```

### Running Migrations

```bash
cd /root/amsa/amsa-backend

# Run all pending migrations
npx sequelize-cli db:migrate

# Rollback last migration
npx sequelize-cli db:migrate:undo
```

### Database Backup

```bash
# Backup database
mysqldump -u your_user -p amsa_database > backup_$(date +%Y%m%d).sql

# Restore from backup
mysql -u your_user -p amsa_database < backup_20250101.sql
```

---

## Troubleshooting

### Pipeline Fails at SSH Connection

**Error:** `Permission denied (publickey)`

**Solution:**
1. Verify `SSH_PRIVATE_KEY` variable is correctly set
2. Check that public key is added to VM's `~/.ssh/authorized_keys`
3. Test SSH connection manually

### Module Not Found Error

**Error:** `Error: Cannot find module 'dotenv'`

**Solution:**
```bash
# SSH into VM
cd /root/amsa/amsa-backend

# Install dependencies
npm install

# Restart
pm2 restart "AMSA Bac"
```

### Database Connection Failed

**Error:** `Access denied for user` or `Can't connect to MySQL`

**Solution:**
```bash
# Check if MySQL is running
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql

# Verify .env file exists and has correct credentials
cat /root/amsa/amsa-backend/.env

# Check if IP is whitelisted (if using remote MySQL)
# Contact database administrator
```

### PM2 Process Crashes

**Error:** Process shows as `errored` in `pm2 list`

**Solution:**
```bash
# View error logs
pm2 logs "AMSA Bac" --err --lines 50

# Common causes:
# 1. Missing dependencies - run npm install
# 2. Wrong .env file - check environment variables
# 3. Port already in use - check for conflicting processes
# 4. Syntax errors - check recent code changes

# Delete and restart
pm2 delete "AMSA Bac"
pm2 start server.js --name "AMSA Bac"
pm2 save
```

### CORS Errors from Frontend

**Error:** Browser console shows `blocked by CORS policy`

**Solution:**
1. Check backend is running: `pm2 list`
2. Verify CORS configuration in `app.js`
3. Ensure `https://amsa.mn` is in `allowedOrigins`
4. Restart backend: `pm2 restart "AMSA Bac"`
5. Test CORS headers with curl (see [CORS Configuration](#cors-configuration))

### API Not Responding

**Error:** 502 Bad Gateway or connection refused

**Solution:**
```bash
# Check if backend is running
pm2 list

# Check if port 3000 is listening
netstat -tulpn | grep 3000

# Check nginx/reverse proxy
sudo nginx -t
sudo systemctl status nginx

# View backend logs
pm2 logs "AMSA Bac" --lines 100
```

---

## Rollback Procedures

### Quick Rollback (Last Commit)

```bash
# SSH into VM
ssh user@vm-host

cd /root/amsa/amsa-backend

# Rollback to previous commit
git reset --hard HEAD~1

# Reinstall dependencies (if package.json changed)
npm install

# Restart
pm2 restart "AMSA Bac"
```

### Rollback to Specific Version

```bash
# Find the commit hash
git log --oneline

# Rollback to specific commit
git reset --hard <commit-hash>

# Reinstall dependencies
npm install

# Restart
pm2 restart "AMSA Bac"
```

### Emergency: Restart Without Changes

If backend is down but code is fine:

```bash
pm2 restart "AMSA Bac"
# or
pm2 stop "AMSA Bac"
pm2 start "AMSA Bac"
```

---

## Health Checks

### Quick Health Check Commands

```bash
# Check PM2 status
pm2 list

# View recent logs
pm2 logs "AMSA Bac" --lines 20

# Check memory usage
pm2 info "AMSA Bac"

# Test local API
curl http://localhost:3000/api/home

# Test public API
curl https://backend.amsa.mn/api/home
```

### Monitoring

```bash
# Real-time monitoring
pm2 monit

# CPU and memory usage
pm2 status

# Save logs to file
pm2 logs "AMSA Bac" > backend-logs.txt
```

---

## Best Practices

1. ✅ **Test locally** before pushing to `master`
   ```bash
   nodemon server.js
   ```

2. ✅ **Check CI/CD pipeline** after pushing
   - Monitor pipeline in GitLab UI
   - Verify successful deployment

3. ✅ **Test API endpoints** after deployment
   - Use Postman or curl
   - Check critical endpoints
   - Monitor error logs

4. ✅ **Monitor PM2 logs** for any errors
   ```bash
   pm2 logs "AMSA Bac" --lines 100
   ```

5. ✅ **Keep .env file secure**
   - Never commit .env to repository
   - Use strong passwords
   - Rotate secrets regularly

6. ❌ **Never** commit directly to `master` without testing
7. ❌ **Never** skip dependency installation after updating code
8. ❌ **Never** expose sensitive credentials in logs

---

## Quick Reference

### Common Commands

```bash
# Deploy (via CI/CD)
git push origin master

# Manual restart on VM
pm2 restart "AMSA Bac"

# View logs
pm2 logs "AMSA Bac"

# Check status
pm2 list

# Full redeploy
cd /root/amsa/amsa-backend && \
  git pull && \
  npm install && \
  pm2 restart "AMSA Bac"
```

### Important File Locations

- **Backend Code:** `/root/amsa/amsa-backend`
- **Environment Variables:** `/root/amsa/amsa-backend/.env`
- **PM2 Config:** `/root/ecosystem.config.js`
- **Logs:** `pm2 logs "AMSA Bac"`

---

**Last Updated:** November 2025  
**Version:** 1.0.0

For issues or questions, contact the development team or create an issue in GitLab.

