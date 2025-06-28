/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['firebasestorage.googleapis.com'],
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://apis.google.com https://cdnjs.cloudflare.com;
              script-src-elem 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://apis.google.com https://cdnjs.cloudflare.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
              style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
              font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:;
              img-src 'self' data: blob: https://firebasestorage.googleapis.com https://www.google.com https://www.gstatic.com https://lh3.googleusercontent.com;
              connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebaseapp.com https://firebaseio.com wss://*.firebaseio.com https://www.googleapis.com https://firebase.googleapis.com https://firestore.googleapis.com https://firebasestorage.googleapis.com;
              frame-src 'self' https://www.google.com https://recaptcha.google.com https://my-rms-validator.firebaseapp.com;
              object-src 'none';
              base-uri 'self';
              form-action 'self';
              frame-ancestors 'none';
              upgrade-insecure-requests;
            `.replace(/\s+/g, ' ').trim(),
          },
        ],
      },
    ];
  },
  // Using integrated Next.js API routes instead of separate Express server
  async rewrites() {
    return [];
  },
  webpack: (config, { isServer }) => {
    // Fix for canvas module in browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }
    return config;
  },
}

module.exports = nextConfig