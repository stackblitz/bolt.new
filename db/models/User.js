import { Model } from 'objection';

export class User extends Model {
  static get tableName() {
    return 'users';
  }

  static get jsonSchema() {
    return {
      type: 'object',
      required: ['username', 'email', 'password'],

      properties: {
        id: { type: 'integer' }, // 主键ID
        username: { type: 'string', minLength: 1, maxLength: 255 }, // 用户名
        email: { type: 'string', format: 'email', maxLength: 255 }, // 电子邮箱
        password: { type: 'string', minLength: 6 }, // 密码
        phone: { type: 'string', maxLength: 20 }, // 手机号
        full_name: { type: 'string', maxLength: 255 }, // 全名
        date_of_birth: { type: 'string', format: 'date' }, // 出生日期
        gender: { type: 'string', enum: ['male', 'female', 'other'] }, // 性别
        bio: { type: 'string' }, // 个人简介
        is_active: { type: 'boolean' }, // 是否激活
      }
    };
  }
}

