import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

// 1. NUEVO: MÉTODO GET PARA LEER UN SOLO ANUNCIO POR SU ID
export async function GET(request) {
  try {
    const id = new URL(request.url).pathname.split('/').pop();
    
    if (!id || id === 'undefined') {
      return NextResponse.json({ success: false, mensaje: 'ID de documento inválido' }, { status: 400 });
    }

    const docRef = await db.collection('jobs').doc(id).get();
    
    if (!docRef.exists) {
      return NextResponse.json({ success: false, mensaje: 'Oferta no encontrada' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: { _id: docRef.id, ...docRef.data() } });
  } catch (error) {
    return NextResponse.json({ success: false, mensaje: error.message }, { status: 500 });
  }
}

// 2. TUS MÉTODOS EXISTENTES INTACTOS
export async function PUT(request) {
  try {
    const id = new URL(request.url).pathname.split('/').pop();
    if (!id || id === 'undefined') throw new Error("ID de documento inválido");

    const body = await request.json();
    Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);
    delete body._id;

    await db.collection('jobs').doc(id).update(body);
    return NextResponse.json({ success: true, mensaje: 'Actualizado correctamente' });
  } catch (error) {
    return NextResponse.json({ success: false, mensaje: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const id = new URL(request.url).pathname.split('/').pop();
    if (!id || id === 'undefined') throw new Error("ID de documento inválido");

    await db.collection('jobs').doc(id).delete();
    return NextResponse.json({ success: true, mensaje: 'Eliminado correctamente' });
  } catch (error) {
    return NextResponse.json({ success: false, mensaje: error.message }, { status: 500 });
  }
}