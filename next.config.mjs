/** @type {import("next").NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        source: '/mobile/:path*',
        headers: [
          {
            key: 'Permissions-Policy',
            value: 'camera=*, gyroscope=*, accelerometer=*',
          },
        ],
      },
    ];
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  }
};
export default nextConfig;
