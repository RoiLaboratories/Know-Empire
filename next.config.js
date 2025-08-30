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
    async redirects() {
      return [
        {
          source: '/.well-known/farcaster.json',
          destination: `https://api.farcaster.xyz/miniapps/hosted-manifest/${process.env.FARCASTER_MANIFEST_ID}`,
          permanent: false,
          statusCode: 307
        }
      ];
    }
  };

  module.exports = nextConfig;