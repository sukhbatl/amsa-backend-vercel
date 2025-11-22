#!/bin/bash
# Production startup script with memory optimization
# Usage: ./start-production.sh

# Set Node.js memory limit (adjust based on your needs)
# 512MB = 512 * 1024 * 1024 = 536870912 bytes
# For a 2GB server, allocating 512MB-768MB to Node.js is reasonable
NODE_MEMORY_LIMIT=512

# Set environment
export NODE_ENV=production

# Start the server with memory limit
node --max-old-space-size=$NODE_MEMORY_LIMIT server.js

