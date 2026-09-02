
// src/app/sitemap.js

export default async function sitemap() {
  const API_URL = 'https://chambafija.com/api/jobs';

  try {
    const res = await fetch(API_URL, {
      cache: 'no-store',
    });

    if (!res.ok) {
      throw new Error(`Error API: ${res.status} ${res.statusText}`);
    }

    const result = await res.json();

    const jobs = result?.data || [];

    const jobUrls = jobs
      .filter((job) => job?._id)
      .map((job) => ({
        url: `https://www.chambafija.com/oferta/${job._id}`,
        lastModified: job.updatedAt
          ? new Date(job.updatedAt)
          : new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      }));

    return [
      {
        url: 'https://www.chambafija.com',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      ...jobUrls,
    ];
  } catch (error) {
    console.error('Error al generar sitemap:', error);

    return [
      {
        url: 'https://chambafija.com',
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ];
  }
}

