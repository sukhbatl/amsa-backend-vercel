require('dotenv').config();

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
                require('dotenv').config();

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
