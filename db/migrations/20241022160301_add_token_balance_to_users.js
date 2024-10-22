export function up(knex) {
    return knex.schema.table('users', function(table) {
      table.bigInteger('token_balance').unsigned().notNullable().defaultTo(0).comment('用户代币余额');
    });
  }
  
  export function down(knex) {
    return knex.schema.table('users', function(table) {
      table.dropColumn('token_balance');
    });
  }