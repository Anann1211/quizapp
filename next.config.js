/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['pdf-parse', 'mammoth']
  },
  api: {
    bodyParser: {
      sizeLimit: '20mb'
    }
  }
}

module.exports = nextConfig
