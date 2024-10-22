import type { OSSPolicy } from './aliyunOSS.server';

export async function uploadToOSS(file: File): Promise<string> {
  try {
    // 获取OSS上传策略
    const policyResponse = await fetch('/api/oss/upload-policy');
    if (!policyResponse.ok) {
      throw new Error('获取上传策略失败');
    }
    const ossPolicy: OSSPolicy = await policyResponse.json();

    // 上传文件到OSS
    const formData = new FormData();
    Object.entries(ossPolicy).forEach(([key, value]) => {
      formData.append(key, value.toString());
    });
    formData.append('file', file);

    const uploadResponse = await fetch(ossPolicy.host, {
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('文件上传失败');
    }

    // 返回文件的URL
    // return `${ossPolicy.host}/${ossPolicy.key}`;
    return `/${ossPolicy.key}`;
  } catch (error) {
    console.error('Upload to OSS failed:', error);
    throw error;
  }
}
