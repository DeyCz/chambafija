export function resolverImagenDrive(valor, ancho = 1600) {
  const limpio = String(valor || '').trim();
  if (!limpio) return '';

  // https://drive.google.com/file/d/ID_AQUI/view?...
  const matchFile = limpio.match(/\/d\/([a-zA-Z0-9_-]{15,})/);
  if (matchFile) {
    return `https://drive.google.com/thumbnail?id=${matchFile[1]}&sz=w${ancho}`;
  }

  // https://drive.google.com/open?id=ID_AQUI o uc?id=ID_AQUI
  const matchQuery = limpio.match(/[?&]id=([a-zA-Z0-9_-]{15,})/);
  if (matchQuery && limpio.includes('drive.google.com')) {
    return `https://drive.google.com/thumbnail?id=${matchQuery[1]}&sz=w${ancho}`;
  }

  // Solo ID de Drive pegado directamente
  if (/^[a-zA-Z0-9_-]{20,60}$/.test(limpio) && !limpio.includes('.')) {
    return `https://drive.google.com/thumbnail?id=${limpio}&sz=w${ancho}`;
  }

  return limpio;
}