import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const body = await request.json();
    await db.collection('jobs').doc(id).update(body);
    return NextResponse.json({ success: true, mensaje: 'Actualizado' });
  } catch (error) {
    return NextResponse.json({ success: false, mensaje: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    await db.collection('jobs').doc(id).delete();
    return NextResponse.json({ success: true, mensaje: 'Eliminado' });
  } catch (error) {
    return NextResponse.json({ success: false, mensaje: error.message }, { status: 500 });
  }
}