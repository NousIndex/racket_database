/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.shopify.com' },
      { protocol: 'https', hostname: '**.yonex.com' },
      { protocol: 'https', hostname: '**.badmintonwarehouse.com' },
      { protocol: 'https', hostname: '**.victorsport.com' },
      { protocol: 'https', hostname: '**.lining.com' },
    ],
  },
};

export default nextConfig;
