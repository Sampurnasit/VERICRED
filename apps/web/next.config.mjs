/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@vericred/shared', '@vericred/crypto', '@vericred/credential-schema'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        readline: false,
      };
    }
    return config;
  },
};

export default nextConfig;
