import OSS from 'ali-oss';
import dotenv from 'dotenv';

dotenv.config();

function getConfig() {
  const region = process.env.ALIYUN_REGION;
  const accessKeyId = process.env.ALIYUN_ACCESS_KEY_ID;
  const accessKeySecret = process.env.ALIYUN_ACCESS_KEY_SECRET;
  const bucket = process.env.ALIYUN_BUCKET;
  if (!region || !accessKeyId || !accessKeySecret || !bucket) {
    return null;
  }
  return {
    region,
    accessKeyId,
    accessKeySecret,
    bucket,
    secure: true
  };
}

export function createOssClient() {
  const config = getConfig();
  if (!config) {
    return null;
  }
  return new OSS(config);
}

export function getOssHost() {
  const config = getConfig();
  if (!config) {
    return '';
  }
  return `https://${config.bucket}.${config.region}.aliyuncs.com`;
}

export function getOssBucket() {
  const config = getConfig();
  return config?.bucket || '';
}
