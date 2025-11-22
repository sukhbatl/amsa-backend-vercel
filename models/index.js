'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];

// Export an object immediately so other modules can require this file.
// We'll populate it once Sequelize has been initialized (with retries).
const db = {};
// readiness flag — set to true after successful Sequelize init
db._ready = false;
db.isReady = () => !!db._ready;
module.exports = db;

// Helper: create Sequelize instance from config
function makeSequelize() {
  if (config.use_env_variable) {
    return new Sequelize(process.env[config.use_env_variable], config);
  }
  return new Sequelize(config.database, config.username, config.password, config);
}

// Async init with retries to tolerate transient DNS failures (e.g. ENOTFOUND)
(async function initWithRetry() {
  const maxAttempts = 3;
  const baseDelayMs = 500; // initial backoff
  let attempt = 0;
  let sequelize;

  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      sequelize = makeSequelize();

      // Try to authenticate to ensure DNS/connectivity is working.
      // Sequelize#authenticate returns a Promise.
      await sequelize.authenticate();

      // If authenticate succeeded, import models and set associations.
      fs
        .readdirSync(__dirname)
        .filter(file => {
          return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
        })
        .forEach(file => {
          // sequelize.import was used in this project (Sequelize v4). Keep it for compatibility.
          const model = sequelize['import'](path.join(__dirname, file));
          db[model.name] = model;
        });

      Object.keys(db).forEach(modelName => {
        if (db[modelName].associate) {
          db[modelName].associate(db);
        }
      });

  db.sequelize = sequelize;
  db.Sequelize = Sequelize;
  db._ready = true;

  console.log(`Database initialized (attempt ${attempt})`);
      return; // success
    } catch (err) {
      // Log details (non-sensitive). If it's a DNS/ENOTFOUND issue, this helps debugging.
      console.warn(`Sequelize init attempt ${attempt} failed:`, err && err.message ? err.message : err);

      // Close the sequelize if partially created
      try { if (sequelize && sequelize.close) await sequelize.close(); } catch (e) { /* ignore */ }

      if (attempt >= maxAttempts) {
        console.error('Sequelize initialization failed after', attempt, 'attempts.');
        // Keep db export present but without sequelize set — callers should handle this gracefully.
        // Also emit an unhandled rejection so logs surface the error (but we prevented process crash here).
        // You can choose to rethrow to crash the process instead if you prefer fail-fast.
        return;
      }

      // Exponential backoff before retrying
      const delay = baseDelayMs * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
})();
