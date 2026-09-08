import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');

    let query = db.collection('jobs');

    if (tipo && tipo !== 'Todos') {
      query = query.where('tipo', '==', tipo);
    }

    const snapshot = await query.get();

    const jobs = [];

    snapshot.forEach(doc => {
      jobs.push({
        _id: doc.id,
        ...doc.data()
      });
    });

    // Mantener los anuncios VIP primero
    jobs.sort((a, b) =>
      b.esVip === a.esVip ? 0 : b.esVip ? 1 : -1
    );

    return NextResponse.json({
      success: true,
      data: jobs
    });

  } catch (error) {
    console.error('Error al obtener empleos:', error);

    return NextResponse.json(
      {
        success: false,
        mensaje: error.message
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    // Fecha real en la que el anuncio fue publicado
    // en ChambaFija. Se genera en el servidor.
    const fechaPublicacion = new Date().toISOString();

    const newJob = {
      ...body,

      // Se genera automáticamente SOLO para saber cuándo
      // se publicó el anuncio.
      fechaPublicacion,

      // Compatibilidad
      createdAt: fechaPublicacion,

      // Las fechas de postulación se conservan exactamente
      // como vienen del formulario.
      fechaInicio: body.fechaInicio || '',
      fechaVencimiento: body.fechaVencimiento || '',
      horaVencimiento: body.horaVencimiento || ''
    };

    // Limpiamos los campos undefined antes de enviarlos a Firebase
    Object.keys(newJob).forEach(key => {
      if (newJob[key] === undefined) {
        delete newJob[key];
      }
    });

    const docRef = await db.collection('jobs').add(newJob);

    return NextResponse.json(
      {
        success: true,
        id: docRef.id,
        mensaje: 'Empleo creado'
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error al crear empleo:', error);

    return NextResponse.json(
      {
        success: false,
        mensaje: error.message
      },
      { status: 500 }
    );
  }
}