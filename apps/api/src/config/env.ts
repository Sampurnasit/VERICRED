import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgrespassword@localhost:5432/vericred_dev?schema=public',
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'dev-insecure-access-secret-min32chars!!',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'dev-insecure-refresh-secret-min32chars!!',
  JWT_ACCESS_EXPIRATION: '15m',
  JWT_REFRESH_EXPIRATION: '7d',
  POLYGON_AMOY_RPC_URL: process.env.POLYGON_AMOY_RPC_URL || 'https://polygon-amoy-bor-rpc.publicnode.com',
  RELAYER_PRIVATE_KEY: process.env.RELAYER_PRIVATE_KEY || process.env.PRIVATE_KEY || '',
  INSTITUTION_REGISTRY_ADDRESS: process.env.INSTITUTION_REGISTRY_ADDRESS || '0xF250601Ca003f6F97ae6a5b24eFFD99FC2D95266',
  CREDENTIAL_REGISTRY_ADDRESS: process.env.CREDENTIAL_REGISTRY_ADDRESS || '0x35E7F512031B4F46c02e76bb1445E2DC38C7AB22',
  REVOCATION_REGISTRY_ADDRESS: process.env.REVOCATION_REGISTRY_ADDRESS || '0xaacEAe5171E339763C3Cb68C5d2841816058DF78',
  ENCRYPTION_MASTER_KEY: process.env.ENCRYPTION_MASTER_KEY || 'vericred_master_encryption_secret_dev_32_chars_min!!',
} as const;
