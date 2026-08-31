/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Aplicar estas cabeceras a todas las rutas de la aplicación
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Protege contra Clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Evita MIME-sniffing
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // SOLUCIÓN A LA VULNERABILIDAD: Desactiva permisos de hardware sensibles no usados
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseapp.com https://*.googleapis.com;",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
              "font-src 'self' data: https://fonts.gstatic.com;",
              "img-src 'self' data: blob: https:;",
              // SOLUCIÓN: Agregamos chambafija.com y limpiamos las rutas viejas de Render y localhost
              "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.firebaseapp.com wss://*.firebaseio.com https://chambafija.vercel.app https://chambafija.com https://www.chambafija.com;",
              "frame-ancestors 'none';",
            ].join(' '),
          },
        ],
      },
      {
        // Corrección de CORS para recursos estáticos / fuentes
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