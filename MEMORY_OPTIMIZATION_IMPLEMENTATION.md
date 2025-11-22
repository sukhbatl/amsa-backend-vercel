# Memory Optimization Implementation Guide

## Changes Made

### 1. Database Connection Pool Optimization ✅

**File:** `config/config.js`

**Changes:**
- Added explicit connection pool limits (max: 5 connections)
- Set connection idle timeout (10 seconds)
- Disabled SQL logging in production

**Impact:** Reduces memory usage by limiting database connections and preventing connection buildup.

### 2. Cache Optimization ✅

**File:** `utility/cache.js`

**Changes:**
- Added cache expiration (30 minutes TTL)
- Optimized data structure (only essential fields)
- Added automatic cache refresh
- Added error handling

**Impact:** Prevents cache from growing indefinitely and reduces memory footprint.

### 3. Production Startup Script ✅

**File:** `start-production.sh`

**Changes:**
- Added Node.js memory limit (512MB)
- Proper environment variable setup

**Impact:** Prevents Node.js from using excessive memory.

---

## Deployment Steps

### Step 1: Update Code on Server

```bash
# SSH into your DigitalOcean droplet
ssh your-droplet-ip

# Navigate to your backend directory
cd /path/to/amsa-backend

# Pull latest changes or copy updated files
git pull  # or manually copy the updated files

# Make startup script executable
chmod +x start-production.sh
```

### Step 2: Restart Application

**If using PM2:**
```bash
pm2 restart amsa-backend
# Or if you need to update the command:
pm2 delete amsa-backend
pm2 start start-production.sh --name amsa-backend
pm2 save
```

**If using systemd or direct node:**
```bash
# Stop current process
pkill -f "node.*server.js"

# Start with new script
./start-production.sh
# Or run in background:
nohup ./start-production.sh > app.log 2>&1 &
```

**If using nodemon (development only):**
```bash
# The config changes will apply automatically
nodemon server
```

### Step 3: Monitor Memory Usage

```bash
# Check overall memory
free -h

# Check Node.js process memory
ps aux | grep node | grep -v grep

# Monitor MySQL memory
mysql -u root -p -e "SHOW VARIABLES LIKE '%buffer%';"

# Real-time monitoring (install htop if needed)
htop
# or
top
```

---

## MySQL Optimization (Optional but Recommended)

### Step 4: Optimize MySQL Configuration

Edit MySQL config file:
```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Add or modify these settings for a 2GB server:
```ini
[mysqld]
# Reduce buffer sizes for low-memory environment
innodb_buffer_pool_size = 256M        # Default is often 128M, but can be reduced
innodb_log_file_size = 64M             # Default is often 48M
key_buffer_size = 32M                  # For MyISAM (if used)
max_connections = 50                   # Limit connections (default is 151)
query_cache_size = 0                   # Disable query cache (deprecated in MySQL 8.0)
tmp_table_size = 32M
max_heap_table_size = 32M
```

**Restart MySQL:**
```bash
sudo service mysql restart
```

**⚠️ Important:** Test these changes in a staging environment first. Some settings may need adjustment based on your specific workload.

---

## Expected Results

### Before Optimization:
- Memory Usage: ~1GB (50% of 2GB)
- Database Connections: Default (potentially unlimited)
- Cache: All posts in memory indefinitely

### After Optimization:
- Memory Usage: ~500-700MB (25-35% of 2GB)
- Database Connections: Max 5
- Cache: Auto-expires after 30 minutes

### Potential Savings:
- **300-500MB memory freed** (15-25% reduction)
- More headroom for traffic spikes
- Possibility to downgrade to 1GB droplet ($6/month) if usage stays below 1GB

---

## Monitoring & Verification

### Check Memory After Deployment:

```bash
# 1. Overall system memory
free -h

# 2. Node.js memory usage
ps aux | grep node

# 3. MySQL memory usage
mysql -u root -p -e "
SELECT 
    variable_name,
    variable_value / 1024 / 1024 AS 'Size (MB)'
FROM information_schema.global_variables
WHERE variable_name IN (
    'innodb_buffer_pool_size',
    'key_buffer_size',
    'tmp_table_size',
    'max_heap_table_size'
);
"

# 4. Active database connections
mysql -u root -p -e "SHOW STATUS LIKE 'Threads_connected';"
```

### Verify Application Still Works:

1. Test API endpoints
2. Test search functionality (uses cache)
3. Test post creation (triggers cache refresh)
4. Monitor error logs

---

## Troubleshooting

### If Memory Usage Doesn't Decrease:

1. **Check for memory leaks:**
   ```bash
   # Monitor Node.js memory over time
   watch -n 5 'ps aux | grep node'
   ```

2. **Check MySQL connections:**
   ```bash
   mysql -u root -p -e "SHOW PROCESSLIST;"
   ```

3. **Check cache size:**
   - Look at logs to see how many posts are cached
   - If you have thousands of posts, consider adding a limit in cache.js

4. **Check for other processes:**
   ```bash
   ps aux --sort=-%mem | head -10
   ```

### If Application Errors Occur:

1. **Check Node.js memory limit:**
   - If you see "JavaScript heap out of memory" errors, increase `NODE_MEMORY_LIMIT` in `start-production.sh`
   - Try 768MB or 1024MB instead of 512MB

2. **Check database connections:**
   - If you see "Too many connections" errors, the pool max might be too low
   - Increase `max` in pool config (but not above 10 for a 2GB server)

3. **Check cache:**
   - If search is slow, cache might not be loading
   - Check logs for cache errors

---

## Additional Optimization Tips

### 1. Enable Gzip Compression (if using nginx)
```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript;
```

### 2. Use CDN for Static Files
- Move images to a CDN (Cloudflare, etc.)
- Reduces server load and memory

### 3. Implement Pagination Everywhere
- Ensure all list endpoints use pagination
- Prevents loading too much data at once

### 4. Regular Cleanup
- Clean old log files
- Remove unused images
- Archive old data

---

## Rollback Plan

If something goes wrong:

1. **Revert code changes:**
   ```bash
   git checkout HEAD~1  # or restore from backup
   ```

2. **Restart with old configuration:**
   ```bash
   pm2 restart amsa-backend
   # or
   node server.js
   ```

3. **Revert MySQL changes:**
   ```bash
   sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
   # Remove or comment out added lines
   sudo service mysql restart
   ```

---

## Next Steps

1. ✅ Deploy code changes
2. ✅ Restart application
3. ⏳ Monitor memory for 24-48 hours
4. ⏳ If memory usage drops significantly, consider:
   - Downgrading to 1GB droplet ($6/month)
   - Or staying on 2GB for more headroom

---

*Last Updated: January 2025*

