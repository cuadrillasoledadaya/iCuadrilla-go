// eslint-disable-next-line @typescript-eslint/no-var-requires
const withPWA = require('@ducanh2912/next-pwa').default({
    dest: 'public',
    cacheOnFrontEndNav: true,
    aggressiveFrontEndNavCaching: true,
    reloadOnOnline: true,
    swMinify: true,
    disable: process.env.NODE_ENV === 'development',
    workboxOptions: {
        disableDevLogs: true,
        runtimeCaching: [
            {
                urlPattern: /^https:\/\/.*\.supabase\.co\/storage\/v1\/object\/public\/.*/,
                handler: 'CacheFirst',
                options: {
                    cacheName: 'supabase-storage',
                    expiration: {
                        maxEntries: 100,
                        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
                    },
                },
            },
            {
                // 🚀 Performance Improvement: Cache API responses for offline support
                urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/.*/,
                handler: 'NetworkFirst',
                options: {
                    cacheName: 'supabase-api',
                    networkTimeoutSeconds: 5,
                    expiration: {
                        maxEntries: 100,
                        maxAgeSeconds: 5 * 60, // 5 minutes
                    },
                },
            },
        ],
    },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.supabase.co',
                pathname: '/storage/v1/object/public/**'
            }
        ],
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    }
}

module.exports = withPWA(nextConfig)
