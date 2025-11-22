module.exports = {
    development: {
        username: "amsamn_website_admin",
        password: "AmsaIT2019db$Password",
        database: "amsamn_website_db",
        host: "164.92.104.38",
        dialect: "mysql",
        operatorsAliases: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
    },
    test: {
        username: "root",
        password: null,
        database: "database_test",
        host: "127.0.0.1",
        dialect: "mysql",
        operatorsAliases: false,
    },
    production: {
        username: process.env.AMSA_MYSQL_USER,
        password: process.env.AMSA_MYSQL_PASSWORD,
        database: process.env.AMSA_MYSQL_DATABASE,
        host: process.env.AMSA_MYSQL_HOST,
        dialect: "mysql",
        operatorsAliases: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        logging: false
    },
};
