/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['next-mdx-remote'],
  cacheComponents: true,
  reactCompiler: true,
  typedRoutes: true,
  reactStrictMode: true,
  output: 'standalone',

  experimental: {
    mdxRs: true,
    turbopackFileSystemCacheForDev: true,
  }
}

export default nextConfig

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
