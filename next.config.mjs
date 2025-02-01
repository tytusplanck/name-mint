/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: '/api/webhooks/stripe',
        destination: '/api/webhooks/stripe/',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
