import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DRIVE_API_URL = 'https://www.googleapis.com/drive/v3/files';

/**
 * GET /api/publicidad
 *
 * Obtiene automáticamente las imágenes de una carpeta pública
 * de Google Drive.
 *
 * Formato recomendado de los archivos:
 *
 * 01__51987654321__Mi negocio.jpg
 * 02__51998765432__Otro negocio.png
 *
 * Estructura:
 * ORDEN__WHATSAPP__NOMBRE.ext
 */

export async function GET() {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
    const apiKey = process.env.GOOGLE_DRIVE_API_KEY;

    if (!folderId) {
      return NextResponse.json(
        {
          success: false,
          mensaje:
            'Falta configurar GOOGLE_DRIVE_FOLDER_ID en las variables de entorno.',
        },
        { status: 500 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          mensaje:
            'Falta configurar GOOGLE_DRIVE_API_KEY en las variables de entorno.',
        },
        { status: 500 }
      );
    }

    /*
     * Solo buscamos imágenes dentro de la carpeta indicada.
     */
    const query = `'${folderId}' in parents and trashed = false and mimeType contains 'image/'`;

    const params = new URLSearchParams({
      q: query,
      key: apiKey,
      fields:
        'files(id,name,mimeType,thumbnailLink,webViewLink,webContentLink,size,createdTime,modifiedTime)',
      orderBy: 'name',
      pageSize: '100',
    });

    const response = await fetch(
      `${DRIVE_API_URL}?${params.toString()}`,
      {
        method: 'GET',
        cache: 'no-store',
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      let errorData = null;

      try {
        errorData = await response.json();
      } catch {
        errorData = null;
      }

      console.error(
        'Error Google Drive API:',
        response.status,
        errorData
      );

      return NextResponse.json(
        {
          success: false,
          mensaje:
            errorData?.error?.message ||
            'No se pudieron obtener las imágenes de Google Drive.',
        },
        { status: response.status }
      );
    }

    const data = await response.json();

    const files = Array.isArray(data.files) ? data.files : [];

    /*
     * Convertimos cada archivo de Drive en un anuncio.
     */
    const publicidades = files
      .map((file) => {
        const nombreArchivo = file.name || '';

        /*
         * Quitamos la extensión.
         */
        const nombreSinExtension = nombreArchivo.replace(
          /\.[^/.]+$/,
          ''
        );

        /*
         * Formato:
         * 01__51987654321__Mi negocio
         *
         * También soporta:
         * 01__51987654321
         * 51987654321__Mi negocio
         * Mi negocio
         */
        const partes = nombreSinExtension
          .split('__')
          .map((parte) => parte.trim())
          .filter(Boolean);

        let orden = 9999;
        let telefono = '';
        let nombre = nombreSinExtension;

        if (partes.length >= 3) {
          /*
           * 01__51987654321__Mi negocio
           */
          const posibleOrden = Number(partes[0]);
          const posibleTelefono = partes[1];

          if (!Number.isNaN(posibleOrden)) {
            orden = posibleOrden;
          }

          if (/^\+?\d{9,15}$/.test(posibleTelefono)) {
            telefono = posibleTelefono.replace(/\D/g, '');
          }

          nombre = partes.slice(2).join(' ');
        } else if (partes.length === 2) {
          /*
           * Puede ser:
           *
           * 01__Mi negocio
           * o
           * 51987654321__Mi negocio
           */
          const primero = partes[0];

          if (/^\d{9,15}$/.test(primero)) {
            telefono = primero.replace(/\D/g, '');
            nombre = partes[1];
          } else if (!Number.isNaN(Number(primero))) {
            orden = Number(primero);
            nombre = partes[1];
          } else {
            nombre = partes.join(' ');
          }
        } else if (partes.length === 1) {
          nombre = partes[0];
        }

        /*
         * URL optimizada para mostrar la imagen.
         *
         * thumbnail permite controlar el tamaño de la imagen
         * sin necesidad de usar next/image.
         */
        const imagen = `https://drive.google.com/thumbnail?id=${encodeURIComponent(
          file.id
        )}&sz=w1600`;

        /*
         * URL alternativa por si se necesita abrir la imagen.
         */
        const imagenOriginal = `https://drive.google.com/uc?export=view&id=${encodeURIComponent(
          file.id
        )}`;

        /*
         * WhatsApp.
         *
         * Si el archivo no tiene número en el nombre,
         * usamos el WhatsApp principal de ChambaFija.
         */
        const numeroWhatsApp =
          telefono || '51967576214';

        const mensaje = `Hola 👋, vi la publicidad de *${nombre}* en ChambaFija y quisiera más información.`;

        const whatsapp = `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(
          mensaje
        )}`;

        return {
          id: file.id,
          nombre,
          telefono: numeroWhatsApp,
          orden,
          imagen,
          imagenOriginal,
          whatsapp,
          mimeType: file.mimeType || '',
          tamaño: file.size || null,
          creado: file.createdTime || null,
          modificado: file.modifiedTime || null,
        };
      })
      /*
       * Orden:
       * 1, 2, 3...
       * y si tienen el mismo orden, por nombre.
       */
      .sort((a, b) => {
        if (a.orden !== b.orden) {
          return a.orden - b.orden;
        }

        return a.nombre.localeCompare(b.nombre, 'es', {
          sensitivity: 'base',
        });
      });

    return NextResponse.json(
      {
        success: true,
        cantidad: publicidades.length,
        publicidades,
      },
      {
        status: 200,
        headers: {
          'Cache-Control':
            'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    console.error(
      'Error en /api/publicidad:',
      error
    );

    return NextResponse.json(
      {
        success: false,
        mensaje:
          'Ocurrió un error interno al cargar las publicidades.',
      },
      { status: 500 }
    );
  }
}