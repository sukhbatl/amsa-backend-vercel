try {
    // dotenv is helpful locally; Vercel injects env vars in production.
    // Wrap in try/catch so requiring the config won't fail if node_modules isn't installed locally.
    require('dotenv').config();
} catch (e) {
    /* ignore if dotenv is not available */
}

const { URL } = require('url');

let productionConfig = {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: false
};

if (process.env.DATABASE_URL) {
    try {
        const dbUrl = new URL(process.env.DATABASE_URL);
        productionConfig.username = dbUrl.username;
        productionConfig.password = dbUrl.password;
        productionConfig.database = dbUrl.pathname.split('/')[1];
        productionConfig.host = dbUrl.hostname;
        productionConfig.port = dbUrl.port;

        console.log('Parsed DB Config:', {
            host: productionConfig.host,
            port: productionConfig.port,
            database: productionConfig.database,
            username: productionConfig.username,
            ssl: productionConfig.dialectOptions.ssl
        });
    } catch (e) {
        console.error('Failed to parse DATABASE_URL:', e);
    }
}

module.exports = {
    development: {
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    },
    test: {
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    },
    production: productionConfig
};
