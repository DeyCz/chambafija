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
      jobs.push({ _id: doc.id, ...doc.data() });
    });

    jobs.sort((a, b) => (b.esVip === a.esVip) ? 0 : b.esVip ? 1 : -1);

    return NextResponse.json({ success: true, data: jobs });
  } catch (error) {
    return NextResponse.json({ success: false, mensaje: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const newJob = { ...body, createdAt: new Date().toISOString() };
    const docRef = await db.collection('jobs').add(newJob);
    
    return NextResponse.json({ success: true, id: docRef.id, mensaje: 'Empleo creado' }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, mensaje: error.message }, { status: 500 });
  }
}