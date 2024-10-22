export function up(knex) {
  return knex('token_reloads').insert([
    {
      name: '代币充值',
      tokens: 10000000,
      price: 20.00,
      description: '非订阅代币购买，每次充值10,000,000代币',
    }
  ]);
}

export function down(knex) {
  return knex('token_reloads').del();
}
