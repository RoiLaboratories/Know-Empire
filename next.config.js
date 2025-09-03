const nextConfig = {
    reactStrictMode: true,
    images: {
      remotePatterns: [
        {
          protocol: 'https',
          hostname: '**',
          pathname: '/**',
        },
      ],
    },
    async headers() {
      return [
        {
          source: '/:path*',
          headers: [
            {
              key: 'Permissions-Policy',
              value: 'clipboard-write=*'
            }
          ],
        }
      ]
    }
  };

  module.exports = nextConfig;