// src/app/sitemap.js

export default async function sitemap() {
  // Conectamos a tu backend en producción
  const API_URL = 'https://chambafija-backend.onrender.com/api/jobs';

  try {
    // 1. Obtenemos todos los empleos de la base de datos sin usar caché
    const res = await fetch(API_URL, { cache: 'no-store' });
    const result = await res.json();
    const jobs = result.data || [];

    // 2. Mapeamos cada empleo a su URL individual (Ruta dinámica)
    const jobUrls = jobs.map((job) => ({
      url: `https://chambafija.vercel.app/oferta/${job._id}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    }));

    // 3. Retornamos la página principal + todas las ofertas
    return [
      {
        url: 'https://chambafija.vercel.app',
        lastModified: new Date(),
        changeFrequency: 'always',
        priority: 1.0,
      },
      ...jobUrls,
    ];
  } catch (error) {
    console.error("Error al generar el sitemap:", error);
    
    // Si la API falla temporalmente, aseguramos que Google indexe al menos el inicio
    return [
      {
        url: 'https://chambafija.vercel.app',
        lastModified: new Date(),
      },
    ];
  }
}