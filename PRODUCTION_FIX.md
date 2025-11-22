# Production Fix - Critical Bug

## Issue Found
The backend was crashing due to a bug in `utility/cache.js` where `setAllVariables()` was called without the proper module export reference.

## Fix Applied

### Bug Fix in `utility/cache.js`
**Line 46:** Changed `setAllVariables()` to `module.exports.setAllVariables()`

This was causing a `ReferenceError: setAllVariables is not defined` error in production.

### Config Cleanup
Removed comments from `config/config.js` production section to ensure compatibility with Sequelize.

## Files Changed
1. ✅ `utility/cache.js` - Fixed function reference
2. ✅ `config/config.js` - Removed comments

## Deployment Steps

### Option 1: Quick Fix (Recommended)
```bash
# SSH into your server
ssh your-server

# Navigate to backend
cd /root/amsa/amsa-backend

# Pull latest changes
git pull origin master

# Restart PM2
pm2 restart "AMSA Bac"

# Check logs
pm2 logs "AMSA Bac" --lines 50
```

### Option 2: Manual File Update
If git pull doesn't work, manually update these files on the server:

1. **Update `utility/cache.js`** - Line 46:
   ```javascript
   // Change from:
   setAllVariables().catch(...)
   
   // To:
   module.exports.setAllVariables().catch(...)
   ```

2. **Update `config/config.js`** - Remove comments from production config

3. **Restart:**
   ```bash
   pm2 restart "AMSA Bac"
   ```

## Verification

After deployment, verify the backend is working:

```bash
# Check PM2 status
pm2 list

# Check logs for errors
pm2 logs "AMSA Bac" --lines 50

# Test API endpoint
curl http://localhost:3000/api/home
```

## Expected Result

- Backend should start without errors
- Cache should load successfully
- API endpoints should respond
- Search functionality should work

## If Issues Persist

1. **Check PM2 logs:**
   ```bash
   pm2 logs "AMSA Bac" --err --lines 100
   ```

2. **Check if cache is loading:**
   Look for "Cache Reset: X posts cached" in logs

3. **Check database connection:**
   Look for "Username:" and "Database:" in startup logs

4. **Rollback if needed:**
   ```bash
   git checkout HEAD~1
   pm2 restart "AMSA Bac"
   ```

