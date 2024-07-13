/** @type {import('next').NextConfig} */
const securityHeaders = [
    {
      key: 'X-Frame-Options',
      value: 'DENY',
    },
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff',
    },
    {
      key: 'Referrer-Policy',
      value: 'no-referrer',
    },
    {
      key: 'X-XSS-Protection',
      value: '1; mode=block',
    },
];
const nextConfig = {
    // basePath: "/proctor-s",
    // output: "export",
    async headers() {
        return [
          {
            // Apply these headers to all routes in your application.
            source: '/(.*)',
            headers: securityHeaders,
          },
        ];
      },
    reactStrictMode: true,
    swcMinify: true,
    productionBrowserSourceMaps: true,
};

export default nextConfig;
