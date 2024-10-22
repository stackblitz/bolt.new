import OSS from 'ali-oss';
import { v4 as uuidv4 } from 'uuid';
import { env } from 'node:process';

// 这些配置应该从环境变量中获取
const ossConfig = {
  region: env.ALIYUN_OSS_REGION!,
  accessKeyId: env.ALIYUN_OSS_ACCESS_KEY_ID!,
  accessKeySecret: env.ALIYUN_OSS_ACCESS_KEY_SECRET!,
  bucket: env.ALIYUN_OSS_BUCKET!,
};

if (Object.values(ossConfig).some(value => value === undefined)) {
  throw new Error('缺少必要的阿里云 OSS 配置');
}

export async function getOSSUploadPolicy() {
  const client = new OSS(ossConfig);
  const date = new Date();
  date.setDate(date.getDate() + 1);
  const policy = {
    expiration: date.toISOString(),
    conditions: [
      ['content-length-range', 0, 1048576000], // 限制文件大小最大为1GB
      ['starts-with', '$key', 'avatars/']
    ]
  };

  const formData = await client.calculatePostSignature(policy);
  const key = `avatars/${uuidv4()}`;

  return {
    ...formData,
    key,
    host: `https://${ossConfig.bucket}.${ossConfig.region}.aliyuncs.com`
  };
}
