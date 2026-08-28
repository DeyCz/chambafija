/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Aplicar a todas las rutas de la aplicación
        source: '/(.*)',
        headers: [
          {
            // Paso 3: Anti-Clickjacking
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Paso 4: Evitar MIME-sniffing
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Paso 1 y Paso 3: Content Security Policy (CSP) + frame-ancestors
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseapp.com https://*.googleapis.com;",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
              "font-src 'self' data: https://fonts.gstatic.com;",
              "img-src 'self' data: blob: https:;",
              "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.firebaseapp.com wss://*.firebaseio.com http://localhost:4000 https://chambafija.vercel.app;",
              "frame-ancestors 'none';",
            ].join(' '),
          },
        ],
      },
      {
        // Paso 2: Corrección de CORS restringido para recursos estáticos / fuentes
        source: '/_next/static/media/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://chambafija.vercel.app',
          },
        ],
      },
    ];
  },
};

export default nextConfig;