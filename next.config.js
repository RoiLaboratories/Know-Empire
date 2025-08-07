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
    
  };

  module.exports = nextConfig;