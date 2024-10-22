export function up(knex) {
  return knex.schema.createTable('chat_histories', function(table) {
    table.increments('_id').primary().comment('主键ID');
    table.integer('user_id').unsigned().notNullable().comment('用户ID');
    table.foreign('user_id').references('users._id').onDelete('CASCADE');
    table.text('message').notNullable().comment('消息内容');
    table.enum('role', ['user', 'assistant']).notNullable().comment('消息角色');
    table.integer('tokens_used').unsigned().comment('使用的代币数量');
    table.string('session_id', 255).comment('会话ID');
    table.timestamp('_create').defaultTo(knex.fn.now()).comment('创建时间');
    table.timestamp('_update').defaultTo(knex.fn.now()).comment('更新时间');
    table.index('user_id');
    table.index('session_id');
  });
}

export function down(knex) {
  return knex.schema.dropTable('chat_histories');
}
