export function up(knex) {
  return knex('subscription_plans').insert([
    {
      name: 'Pro',
      tokens: 10000000,
      price: 20.00,
      description: '适合业余爱好者和轻度探索性使用的休闲用户。',
      save_percentage: null,
    },
    {
      name: 'Pro 50',
      tokens: 26000000,
      price: 50.00,
      description: '为每周需要使用多八多几次的专业人士设计。',
      save_percentage: 3,
    },
    {
      name: 'Pro 100',
      tokens: 55000000,
      price: 100.00,
      description: '完美适合希望提升日常工作流程的重度用户。',
      save_percentage: 9,
    },
    {
      name: 'Pro 200',
      tokens: 120000000,
      price: 200.00,
      description: '最适合依赖多八多作为核心工具持续使用的超级用户。',
      save_percentage: 17,
    },
  ]);
}

export function down(knex) {
  return knex('subscription_plans').del();
}
