export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/Panel08/', '/mipanel/'],
    },
    sitemap: 'https://www.chambafija.com/sitemap.xml',
  };
}