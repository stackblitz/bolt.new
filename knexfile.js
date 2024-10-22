// knexfile.js
export default {
  development: {
    client: 'mysql2',
    connection: {
      host: 'devide.y2o.me',
      user: 'd8d_design_ai',
      password: 'Kw8aEcm37FwNaCk6',
      database: 'bolt_development',
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
      max: 10
    },
    migrations: {
      directory: './db/migrations'
    },
    seeds: {
      directory: './db/seeds'
    }
  }
};
