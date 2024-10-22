import { json } from '@remix-run/node';
import type { LoaderFunction } from '@remix-run/node';
import { getOSSUploadPolicy, type OSSPolicy } from '~/utils/aliyunOSS.server';

export const loader: LoaderFunction = async () => {
  try {
    const policy: OSSPolicy = await getOSSUploadPolicy();
    return json(policy);
  } catch (error) {
    console.error('Error generating OSS upload policy:', error);
    return json({ error: '获取上传策略失败' }, { status: 500 });
  }
};
