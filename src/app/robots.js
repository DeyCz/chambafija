// src/app/robots.js

export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/Panel08/', // Evita que Google indexe tu panel privado
    },
    sitemap: 'https://chambafija.com/sitemap.xml',
  };
}