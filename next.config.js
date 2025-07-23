/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Performance optimizations
  experimental: {
    serverComponentsExternalPackages: [
      'puppeteer', 
      'canvas', 
      'sharp',
      '@opentelemetry/sdk-node',
      '@opentelemetry/instrumentation',
      'handlebars',
      'require-in-the-middle'
    ],
    optimizeCss: true,
    optimizeServerReact: true,
    serverMinification: true,
  },
  // Vercel optimizations
  outputFileTracing: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
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
              script-src-elem 'self' 'unsafe-inline' https://www.google.com https://www.gstatic.com https://www.googletagmanager.com https://apis.google.com https://cdnjs.cloudflare.com https://js.stripe.com;
              style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
              style-src-elem 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com;
              font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com data:;
              img-src 'self' data: blob: https://firebasestorage.googleapis.com https://www.google.com https://www.gstatic.com https://lh3.googleusercontent.com https://cdn.prod.website-files.com;
              connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://firebaseapp.com https://firebaseio.com wss://*.firebaseio.com https://www.googleapis.com https://firebase.googleapis.com https://firestore.googleapis.com https://firebasestorage.googleapis.com https://api.stripe.com https://firebaseinstallations.googleapis.com https://content-firebaseappcheck.googleapis.com;
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
  webpack: (config, { isServer, dev }) => {
    // Fix for canvas module in browser environment
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        canvas: false,
      };
    }
    
    // Performance optimizations
    if (isServer) {
      config.externals = [
        ...config.externals, 
        'canvas', 
        'sharp',
        '@opentelemetry/sdk-node',
        '@opentelemetry/instrumentation',
        '@opentelemetry/exporter-jaeger',
        'handlebars',
        'require-in-the-middle'
      ];
    }
    
    // Bundle optimization
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        ...config.optimization.splitChunks,
        cacheGroups: {
          ...config.optimization.splitChunks.cacheGroups,
          ai: {
            test: /[\\/]ai[\\/]/,
            name: 'ai-chunk',
            chunks: 'all',
            priority: 10,
          },
          pdf: {
            test: /[\\/](pdf|jspdf|puppeteer)[\\/]/,
            name: 'pdf-chunk',
            chunks: 'all',
            priority: 10,
          },
        },
      },
    };
    
    // Suppress problematic warnings
    config.ignoreWarnings = [
      { module: /node_modules\/@opentelemetry/ },
      { module: /node_modules\/handlebars/ },
      { module: /node_modules\/require-in-the-middle/ },
      /require.extensions is not supported by webpack/,
      /Critical dependency: require function is used in a way/,
      /Can't resolve '@opentelemetry\/exporter-jaeger'/,
    ];
    
    return config;
  },
}

module.exports = nextConfig