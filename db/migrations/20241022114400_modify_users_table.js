export function up(knex) {
  return knex.schema.alterTable('users', function(table) {
    // 修改手机号为必填
    table.string('phone', 20).notNullable().alter();
    
    // 修改用户名为选填
    table.string('username', 255).nullable().alter();
    
    // 修改电子邮箱为选填
    table.string('email', 255).nullable().alter();
  });
}

export function down(knex) {
  return knex.schema.alterTable('users', function(table) {
    // 恢复原来的设置
    table.string('phone', 20).nullable().alter();
    table.string('username', 255).notNullable().alter();
    table.string('email', 255).notNullable().alter();
  });
}
