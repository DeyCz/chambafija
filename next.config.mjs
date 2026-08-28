/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración de cabeceras de seguridad HTTP
  async headers() {
    return [
      {
        // Aplicar estas cabeceras a todas las rutas de la aplicación
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY', // Protege contra vulnerabilidades de Clickjacking
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff', // Evita el MIME-sniffing de archivos
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin', // Protege la información de la URL de procedencia
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self';",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseapp.com https://*.googleapis.com;",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;",
              "font-src 'self' data: https://fonts.gstatic.com;",
              "img-src 'self' data: blob: https:;",
              "connect-src 'self' https://*.firebaseio.com https://*.googleapis.com https://*.firebaseapp.com wss://*.firebaseio.com http://localhost:4000 https://chambafija.vercel.app;",
              "frame-ancestors 'none';", // Refuerza la protección anti-clickjacking
            ].join(' '),
          },
        ],
      },
      {
        // Regla específica para corregir la alerta de CORS en archivos estáticos / fuentes
        source: '/_next/static/media/(.*)',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: 'https://chambafija.vercel.app', // Limita el acceso cross-domain únicamente a tu dominio
          },
        ],
      },
    ];
  },
};

export default nextConfig;