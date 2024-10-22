export function up(knex) {
  return knex.schema.createTable('token_reloads', function(table) {
    table.increments('_id').primary().comment('主键ID');
    table.string('name', 50).notNullable().unique().comment('充值包名称');
    table.integer('tokens').unsigned().notNullable().comment('代币数量');
    table.decimal('price', 10, 2).notNullable().comment('价格');
    table.text('description').comment('描述');
    table.boolean('is_active').defaultTo(true).comment('是否激活');
    table.timestamp('_create').defaultTo(knex.fn.now()).comment('创建时间');
    table.timestamp('_update').defaultTo(knex.fn.now()).comment('更新时间');
  });
}

export function down(knex) {
  return knex.schema.dropTable('token_reloads');
}
