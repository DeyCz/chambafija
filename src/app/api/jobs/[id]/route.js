import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function PUT(request) {
  try {
    // Extraemos el ID directamente de la ruta (URL) de forma segura
    const id = new URL(request.url).pathname.split('/').pop();
    
    if (!id || id === 'undefined') {
      throw new Error("ID de documento inválido");
    }

    const body = await request.json();
    
    // Firebase prohíbe guardar campos undefined. Los eliminamos:
    Object.keys(body).forEach(key => body[key] === undefined && delete body[key]);
    delete body._id; // No podemos sobreescribir el ID de Firebase

    await db.collection('jobs').doc(id).update(body);
    return NextResponse.json({ success: true, mensaje: 'Actualizado correctamente' });
  } catch (error) {
    return NextResponse.json({ success: false, mensaje: error.message }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const id = new URL(request.url).pathname.split('/').pop();

    if (!id || id === 'undefined') {
      throw new Error("ID de documento inválido");
    }

    await db.collection('jobs').doc(id).delete();
    return NextResponse.json({ success: true, mensaje: 'Eliminado correctamente' });
  } catch (error) {
    return NextResponse.json({ success: false, mensaje: error.message }, { status: 500 });
  }
}