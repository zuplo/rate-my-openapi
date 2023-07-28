/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: [
      "@stoplight/spectral-core", 
      "@stoplight/spectral-parsers", 
      "@stoplight/spectral-ruleset-bundler",
      "fsevents",
      "@rate-my-openapi/core",
      "retry-request",
      "node-fetch"
    ],
  }
};

module.exports = nextConfig;
