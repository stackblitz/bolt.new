export function up(knex) {
  return knex.schema.createTable('user_subscriptions', function(table) {
    table.increments('_id').primary().comment('主键ID');
    table.integer('user_id').unsigned().notNullable().comment('用户ID');
    table.foreign('user_id').references('users._id').onDelete('CASCADE');
    table.integer('plan_id').unsigned().notNullable().comment('订阅计划ID');
    table.foreign('plan_id').references('subscription_plans._id');
    table.date('start_date').notNullable().comment('订阅开始日期');
    table.date('expiration_date').notNullable().comment('订阅过期日期');
    table.enum('status', ['active', 'expired', 'cancelled']).notNullable().comment('订阅状态');
    table.timestamp('_create').defaultTo(knex.fn.now()).comment('创建时间');
    table.timestamp('_update').defaultTo(knex.fn.now()).comment('更新时间');
    table.index('user_id');
    table.index('plan_id');
    table.index('expiration_date');
  });
}

export function down(knex) {
  return knex.schema.dropTable('user_subscriptions');
}
