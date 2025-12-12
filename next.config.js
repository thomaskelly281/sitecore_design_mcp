/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable standalone output for better serverless performance
  output: 'standalone',
  
  // Ensure docs directory is included
  serverRuntimeConfig: {
    projectRoot: process.cwd(),
  },
};

module.exports = nextConfig;

