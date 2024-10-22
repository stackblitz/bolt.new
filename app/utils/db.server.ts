import knex from 'knex';
import type { Knex } from 'knex';

let db: Knex;

declare global {
  var __db: Knex | undefined;
}

// 这个检查可以防止在开发模式下多次创建连接
if (process.env.NODE_ENV === 'production') {
  db = getDb();
} else {
  if (!global.__db) {
    global.__db = getDb();
  }
  db = global.__db;
}

function getDb() {
  return knex({
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT) || 3306,
    },
    pool: {
      min: 2,
      max: 10
    }
  });
}

export { db };
