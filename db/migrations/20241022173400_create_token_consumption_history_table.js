export function up(knex) {
  return knex.schema.createTable('token_consumption_history', function(table) {
    table.increments('_id').primary().comment('主键ID');
    table.integer('user_id').unsigned().notNullable().comment('用户ID');
    table.foreign('user_id').references('users._id').onDelete('CASCADE');
    table.integer('tokens_consumed').unsigned().notNullable().comment('消耗的代币数量');
    table.string('session_id', 255).comment('会话ID');
    table.timestamp('_create').defaultTo(knex.fn.now()).comment('消耗时间');
    table.text('context').comment('消耗上下文');
    table.index('user_id');
    table.index('session_id');
  });
}

export function down(knex) {
  return knex.schema.dropTable('token_consumption_history');
}
