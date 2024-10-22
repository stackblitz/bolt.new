export function up(knex) {
  return knex.schema.table('users', function(table) {
    table.string('nickname', 255).notNullable().comment('用户昵称');
    table.string('avatar_url', 1000).comment('头像URL');
  });
}

export function down(knex) {
  return knex.schema.table('users', function(table) {
    table.dropColumn('nickname');
    table.dropColumn('avatar_url');
  });
}
