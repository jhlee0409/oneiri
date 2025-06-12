/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/journal",
        destination: "/library/dreams",
        permanent: true,
      },
      {
        source: "/story/:id",
        destination: "/library/dreams/:id",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
