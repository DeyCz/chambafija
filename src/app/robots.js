export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/Panel08/', '/mipanel/'],
    },
    sitemap: 'https://chambafija.com/sitemap.xml',
  };
}