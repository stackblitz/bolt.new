import knex from 'knex';
import type { Knex } from 'knex';
import { env } from 'node:process';

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
      host: env.DB_HOST,
      user: env.DB_USER,
      password: env.DB_PASSWORD,
      database: env.DB_NAME,
      port: Number(env.DB_PORT) || 3306,
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
  });
}

export { db };
