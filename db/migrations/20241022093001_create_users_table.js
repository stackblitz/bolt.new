exports.up = function(knex) {
  return knex.schema.createTable('users', function(table) {
    table.increments('_id').primary().comment('主键ID');
    table.string('username', 255).notNullable().unique().comment('用户名');
    table.string('email', 255).notNullable().unique().comment('电子邮箱');
    table.string('password', 255).notNullable().comment('密码');
    table.string('phone', 20).unique().comment('手机号');
    table.string('full_name', 255).comment('全名');
    table.date('date_of_birth').comment('出生日期');
    table.enum('gender', ['male', 'female', 'other']).comment('性别');
    table.text('bio').comment('个人简介');
    table.boolean('is_active').defaultTo(true).comment('是否激活');
    table.timestamp('_create').defaultTo(knex.fn.now()).comment('创建时间');
    table.timestamp('_update').defaultTo(knex.fn.now()).comment('更新时间');
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
