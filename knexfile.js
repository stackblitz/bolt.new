// knexfile.js
export default {
  development: {
    client: 'mysql2',
    connection: {
      host: 'devide.y2o.me',
      user: 'd8d_design_ai',
      password: 'Kw8aEcm37FwNaCk6',
      database: 'd8d_design_ai',
      port: 13306
    },
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  },

  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    pool: {
      min: 2,
      max: 10,
      createTimeoutMillis: 3000,
      acquireTimeoutMillis: 30000,
      idleTimeoutMillis: 30000,
      reapIntervalMillis: 1000,
      createRetryIntervalMillis: 100,
      propagateCreateError: false, // 重要：这将允许连接池在初始连接失败时继续尝试
    },
    acquireConnectionTimeout: 60000,
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  }
};
