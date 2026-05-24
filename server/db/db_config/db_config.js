require('dotenv').config();

const baseConfig = {
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || 3306,
  dialect: 'mysql',
  logging: false,
  dialectOptions: {
    connectTimeout: Number(process.env.DB_CONNECT_TIMEOUT) || 60000,
  },
  pool: {
    max: Number(process.env.DB_POOL_MAX) || 5,
    min: 0,
    acquire: 60000,
    idle: 10000,
    evict: 10000,
  },
  define: {
    timestamps: true,
  },
  retry: {
    max: 3,
  },
};

module.exports = {
  development: baseConfig,
  test: baseConfig,
  production: baseConfig,
};
