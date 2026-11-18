import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

const estaVigenteEnPeru = (job) => {
  if (!job.fechaVencimiento) return true;

  const fechaString = String(job.fechaVencimiento).split('T')[0];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fechaString)) return true;

  let hh = '23';
  let mm = '59';

  if (job.horaVencimiento) {
    const [hours, minutes] = String(job.horaVencimiento).split(':');
    const hNum = parseInt(hours, 10);
    const mNum = parseInt(minutes, 10);
    if (!Number.isNaN(hNum) && hNum >= 0 && hNum <= 23) {
      hh = String(hNum).padStart(2, '0');
    }
    if (!Number.isNaN(mNum) && mNum >= 0 && mNum <= 59) {
      mm = String(mNum).padStart(2, '0');
    }
  }

  // Hora oficial de Perú (UTC-5) para evitar desfases con los servidores UTC de Vercel
  const fechaExp = new Date(`${fechaString}T${hh}:${mm}:59-05:00`);
  return Number.isNaN(fechaExp.getTime()) || Date.now() <= fechaExp.getTime();
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo');
    const soloVigentes = searchParams.get('soloVigentes') === '1';

    let query = db.collection('jobs');

    if (tipo && tipo !== 'Todos') {
      query = query.where('tipo', '==', tipo);
    }

    const snapshot = await query.get();
    const jobs = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      if (soloVigentes && !estaVigenteEnPeru(data)) return;

      jobs.push({
        _id: doc.id,
        ...data,
      });
    });

    jobs.sort((a, b) => (b.esVip === a.esVip ? 0 : b.esVip ? 1 : -1));

    const headers = {
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
    };

    return NextResponse.json(
      {
        success: true,
        data: jobs,
      },
      { headers }
    );
  } catch (error) {
    console.error('Error al obtener empleos:', error);

    return NextResponse.json(
      {
        success: false,
        mensaje: error.message,
      },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const fechaPublicacion = new Date().toISOString();

    const newJob = {
      ...body,
      fechaPublicacion,
      createdAt: fechaPublicacion,
      fechaInicio: body.fechaInicio || '',
      fechaVencimiento: body.fechaVencimiento || '',
      horaVencimiento: body.horaVencimiento || '',
    };

    Object.keys(newJob).forEach((key) => {
      if (newJob[key] === undefined) {
        delete newJob[key];
      }
    });

    const docRef = await db.collection('jobs').add(newJob);

    return NextResponse.json(
      {
        success: true,
        id: docRef.id,
        mensaje: 'Empleo creado',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear empleo:', error);

    return NextResponse.json(
      {
        success: false,
        mensaje: error.message,
      },
      { status: 500 }
    );
  }
}