export const APP_CONSTANTS = {
  APP_NAME: 'VERICRED',
  TAGLINE: 'Your Achievements. Your Credentials. Your Control.',
  VERSION: '0.1.0',
  DEFAULT_SCALE_FACTOR: 100,
  MIN_CGPA: 0,
  MAX_CGPA: 10,
  MAX_SCALED_CGPA: 1000,
  PRESENTATION_TTL_SECONDS: 900, // 15 minutes
  ARGON2_PARAMS: {
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
    saltLength: 16,
  },
} as const;

export const DEMO_INSTITUTION = {
  LEGAL_NAME: 'RCC Institute of Information Technology',
  SHORT_CODE: 'RCC-IIT',
  BLOCKCHAIN_ADDRESS: '0x71C83648E75C4782F485B8F9A1058D14881E995F',
  WEBSITE: 'https://www.rcciit.org',
  ADMIN_EMAIL: 'registrar@rcciit.ac.in',
} as const;
