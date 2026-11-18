'use client';

import React, { useEffect, useRef, useState } from 'react';
import { resolverImagenDrive } from '@/lib/driveImage';

const STORAGE_SESSION_KEY = 'cf_popup_visto_sesion';
const STORAGE_TIME_KEY = 'cf_popup_ultima_vez';
const STORAGE_INDEX_KEY = 'cf_popup_indice';

export default function PopupPublicidad({
  config,
  anuncios = [],
  cargado = false,
  whatsappPublicidadUrl,
}) {
  const [abierto, setAbierto] = useState(false);
  const [actual, setActual] = useState(null);
  const [errorImg, setErrorImg] = useState(false);
  const iniciadoRef = useRef(false);
  const ultimoEnvioClicRef = useRef(0);

  useEffect(() => {
    if (!cargado || iniciadoRef.current) return;
    if (!config?.habilitado || !Array.isArray(anuncios) || anuncios.length === 0) {
      return;
    }

    iniciadoRef.current = true;

    try {
      if (config.modo === 'sesion') {
        if (sessionStorage.getItem(STORAGE_SESSION_KEY) === '1') return;
      } else if (config.modo === 'minutos') {
        const ultima = Number(localStorage.getItem(STORAGE_TIME_KEY) || 0);
        const esperaMs = (Number(config.cadaMinutos) || 30) * 60 * 1000;
        if (ultima && Date.now() - ultima < esperaMs) return;
      }
    } catch {}

    let indiceElegido = 0;
    try {
      const guardado = Number(localStorage.getItem(STORAGE_INDEX_KEY) || 0);
      if (Number.isFinite(guardado) && guardado >= 0) {
        indiceElegido = guardado % anuncios.length;
      }
    } catch {}

    setActual(anuncios[indiceElegido] || anuncios[0]);

    const timer = window.setTimeout(() => {
      setAbierto(true);
      try {
        sessionStorage.setItem(STORAGE_SESSION_KEY, '1');
        localStorage.setItem(STORAGE_TIME_KEY, String(Date.now()));
        localStorage.setItem(
          STORAGE_INDEX_KEY,
          String((indiceElegido + 1) % anuncios.length)
        );
      } catch {}
    }, Number(config.retrasoMs ?? 600));

    return () => window.clearTimeout(timer);
  }, [cargado, config, anuncios]);

  useEffect(() => {
    if (!abierto) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e) => {
      if (e.key === 'Escape') setAbierto(false);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [abierto]);

  if (!abierto || !actual || errorImg) return null;

  const imgUrl = resolverImagenDrive(actual.imagen, 1600);
  if (!imgUrl) return null;

  const numero = String(actual.whatsapp || '').replace(/\D/g, '');
  const destinoUrl =
    actual.enlace && actual.enlace.trim() !== ''
      ? actual.enlace.trim()
      : numero
      ? `https://api.whatsapp.com/send?phone=51${numero}&text=${encodeURIComponent(
          actual.mensaje ||
            `Hola, vi el anuncio de ${actual.nombre || 'su negocio'} en ChambaFija.`
        )}`
      : '';

  const registrarClic = () => {
    const ahora = Date.now();
    if (ahora - ultimoEnvioClicRef.current < 2000) return;
    ultimoEnvioClicRef.current = ahora;

    if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
      window.gtag('event', 'click_popup_publicidad', {
        anuncio_id: actual._id,
        anuncio_nombre: actual.nombre,
      });
    }

    if (actual?._id) {
      fetch('/api/popup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'click',
          coleccion: 'popup',
          id: actual._id,
        }),
        keepalive: true,
      }).catch(() => {});
    }
  };

  const formato = actual.formato || 'auto';

  // Compacto en celular (deja ver el fondo alrededor) y mantiene tamaño actual en PC (sm:)
  const maxAnchoModal =
    formato === 'vertical'
      ? 'max-w-[250px] sm:max-w-[360px]'
      : formato === 'cuadrado'
      ? 'max-w-[275px] sm:max-w-[400px]'
      : formato === 'horizontal'
      ? 'max-w-[300px] sm:max-w-[500px]'
      : 'max-w-[275px] sm:max-w-[400px]';

  const claseContenedorImg =
    formato === 'cuadrado'
      ? 'aspect-square max-h-[38vh] sm:max-h-none w-full overflow-hidden bg-[#0B132B]'
      : formato === 'vertical'
      ? 'aspect-[4/5] max-h-[42vh] sm:max-h-[56vh] w-full overflow-hidden bg-[#0B132B]'
      : formato === 'horizontal'
      ? 'aspect-video w-full overflow-hidden bg-[#0B132B]'
      : 'w-full bg-[#0B132B] flex items-center justify-center';

  const claseImg =
    formato === 'auto'
      ? 'w-full h-auto max-h-[38vh] sm:max-h-[56vh] object-contain mx-auto block'
      : 'w-full h-full object-cover block';

  const imagenElemento = (
    <img
      src={imgUrl}
      alt={actual.nombre || 'Publicidad ChambaFija'}
      referrerPolicy="no-referrer"
      decoding="async"
      onError={() => setErrorImg(true)}
      className={claseImg}
    />
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Publicidad de ${actual.nombre || 'ChambaFija'}`}
      className="fixed inset-0 z-[60] bg-[#0B132B]/70 backdrop-blur-[2px] flex items-center justify-center p-6 sm:p-5 animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) setAbierto(false);
      }}
    >
      <div
        className={`relative w-full ${maxAnchoModal} max-h-[82vh] overflow-y-auto bg-white rounded-2xl sm:rounded-3xl shadow-[0_20px_55px_-12px_rgba(0,0,0,0.6)] border border-white/20 animate-modal`}
      >
        {/* Barra superior flotante compacta en móvil */}
        <div className="absolute top-2 left-2 right-2 sm:top-3 sm:left-3 sm:right-3 z-20 flex items-center justify-between gap-2 pointer-events-none">
          <span className="pointer-events-auto inline-flex items-center gap-1 bg-[#0B132B]/85 backdrop-blur-md text-[#06D6A0] text-[9px] sm:text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border border-white/15 shadow-sm">
            {actual.etiqueta || '⭐ Anuncio Destacado'}
          </span>

          <button
            type="button"
            onClick={() => setAbierto(false)}
            aria-label="Cerrar anuncio"
            className="pointer-events-auto w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#0B132B]/85 hover:bg-[#0B132B] text-white text-xs sm:text-sm font-extrabold flex items-center justify-center border border-white/25 shadow-lg transition-transform active:scale-95 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Imagen del flyer */}
        <div className={claseContenedorImg}>
          {destinoUrl ? (
            <a
              href={destinoUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={registrarClic}
              className="block w-full h-full"
            >
              {imagenElemento}
            </a>
          ) : (
            imagenElemento
          )}
        </div>

        {/* Texto y botones compactos en móvil */}
        <div className="p-3 sm:p-5 bg-white space-y-2 sm:space-y-3">
          {(actual.nombre || actual.subtitulo) && (
            <div className="text-center">
              {actual.nombre && (
                <h3 className="text-sm sm:text-lg font-extrabold text-[#0B132B] leading-tight">
                  {actual.nombre}
                </h3>
              )}
              {actual.subtitulo && (
                <p className="text-[11px] sm:text-xs text-slate-500 font-semibold mt-0.5 sm:mt-1 leading-snug line-clamp-2">
                  {actual.subtitulo}
                </p>
              )}
            </div>
          )}

          <div className="flex flex-col gap-1.5 sm:gap-2">
            {destinoUrl && (
              <a
                href={destinoUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={registrarClic}
                className="w-full text-center bg-[#06D6A0] hover:bg-emerald-400 text-[#0B132B] text-xs sm:text-sm font-extrabold py-2.5 sm:py-3.5 px-4 sm:px-5 rounded-xl sm:rounded-2xl shadow-md shadow-[#06D6A0]/25 transition-all active:scale-[0.99]"
              >
                {actual.textoBoton || '📲 Contactar ahora'}
              </a>
            )}

            <button
              type="button"
              onClick={() => setAbierto(false)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] sm:text-xs font-extrabold py-1.5 sm:py-2.5 px-3 sm:px-4 rounded-lg sm:rounded-xl transition-colors cursor-pointer"
            >
              Continuar a ChambaFija
            </button>
          </div>

          {config?.mostrarBarraAnunciate !== false && whatsappPublicidadUrl && (
            <div className="pt-1.5 sm:pt-2 border-t border-slate-100 text-center">
              <a
                href={whatsappPublicidadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] sm:text-[11px] font-bold text-slate-400 hover:text-emerald-700 transition-colors"
              >
                📢 ¿Quieres mostrar tu negocio aquí?{' '}
                <span className="underline text-emerald-700 font-extrabold">
                  Anuncia aquí
                </span>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}