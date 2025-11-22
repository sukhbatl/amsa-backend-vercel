try {
    // dotenv is helpful locally; Vercel injects env vars in production.
    // Wrap in try/catch so requiring the config won't fail if node_modules isn't installed locally.
    require('dotenv').config();
} catch (e) {
    /* ignore if dotenv is not available */
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
    production: {
        use_env_variable: 'DATABASE_URL',
        dialect: 'postgres',
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false // Required for some Supabase pooler configurations
            }
        },
        logging: false
    }
};
