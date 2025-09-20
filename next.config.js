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
              value: 'clipboard-write=self'
            }
          ],
        },
        {
          source: '/seller/orders',
          headers: [
            {
              key: 'Permissions-Policy',
              value: 'clipboard-write=self'
            }
          ],
        },
        {
          source: '/buyer/order_management',
          headers: [
            {
              key: 'Permissions-Policy',
              value: 'clipboard-write=self'
            }
          ],
        }
      ]
    }
  };

  module.exports = nextConfig;