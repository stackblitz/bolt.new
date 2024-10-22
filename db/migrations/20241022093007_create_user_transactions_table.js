export function up(knex) {
  return knex.schema.createTable('user_transactions', function(table) {
    table.increments('_id').primary().comment('主键ID');
    table.integer('user_id').unsigned().notNullable().comment('用户ID');
    table.foreign('user_id').references('users._id').onDelete('CASCADE');
    table.enum('type', ['subscription', 'token_reload']).notNullable().comment('交易类型');
    table.integer('plan_id').unsigned().comment('订阅计划ID');
    table.foreign('plan_id').references('subscription_plans._id');
    table.integer('token_reload_id').unsigned().comment('代币充值包ID');
    table.foreign('token_reload_id').references('token_reloads._id');
    table.decimal('amount', 10, 2).notNullable().comment('交易金额');
    table.integer('tokens').unsigned().notNullable().comment('代币数量');
    table.enum('status', ['pending', 'completed', 'failed', 'refunded']).notNullable().comment('交易状态');
    table.string('payment_method', 50).comment('支付方式');
    table.string('transaction_id', 255).comment('外部交易ID');
    table.timestamp('_create').defaultTo(knex.fn.now()).comment('创建时间');
    table.timestamp('_update').defaultTo(knex.fn.now()).comment('更新时间');
    table.index('user_id');
    table.index(['type', 'status']);
  });
}

export function down(knex) {
  return knex.schema.dropTable('user_transactions');
}
