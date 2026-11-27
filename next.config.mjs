/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {},
  rewrites: async () => {
    return [
      {
        source: '/py-api/:path*',
        destination:
          process.env.NODE_ENV === 'development'
            ? 'http://127.0.0.1:8000/py-api/:path*'
            : '/api/:path*',
      },
    ];
  },
};

export default nextConfig;
