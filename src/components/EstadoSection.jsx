'use client';
import React from 'react';

export default function EstadoSection({ convocatorias, onOpenDetail }) {
  if (!convocatorias || convocatorias.length === 0) {
    return (
      <div className="py-16 text-center text-slate-500">
        <p className="text-base font-semibold">No hay convocatorias del Estado disponibles en este momento 🏛️</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {convocatorias.map((conv) => (
        <div 
          key={conv._id} 
          className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-5 sm:p-6 relative overflow-hidden"
        >
          {/* BARRA LATERAL INSTITUCIONAL */}
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#0F172A]"></div>

          {/* ENCABEZADO DE LA CONVOCATORIA */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 pb-3 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-inner">
                🏛️
              </div>
              <div>
                <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md uppercase tracking-wider">
                  Proceso Oficial del Estado
                </span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5">
                  {conv.empresa}: {conv.titulo}
                </h3>
              </div>
            </div>
            {conv.esVip && (
              <span className="bg-amber-100 text-amber-800 text-[11px] font-bold px-2.5 py-1 rounded-lg border border-amber-200">
                ⭐ Convocatoria Destacada
              </span>
            )}
          </div>

          {/* DETALLES Y REQUISITOS POR PERFIL */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-5 space-y-3">
            <div className="flex items-start gap-2">
              <span className="text-base">🎓</span>
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wide">Perfil / Requisitos:</p>
                <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed mt-0.5">
                  {conv.requisitos || conv.descripcion}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-xs text-slate-600">
              <div className="flex items-center gap-1.5 font-medium">
                <span>📍</span> <span>Ubicación: <strong className="text-slate-800">{conv.ubicacion || 'Pasco'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span>👥</span> <span>Plazas: <strong className="text-slate-800">{conv.plazas || '1 o más'}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span>💰</span> <span>Sueldo: <strong className="text-emerald-600 font-extrabold">{conv.sueldo || 'Según Ley'}</strong></span>
              </div>
            </div>

            {conv.cronograma && (
              <div className="text-[11px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200/50 flex items-center gap-1.5">
                <span>🕒</span> <span><strong>Cronograma clave:</strong> {conv.cronograma}</span>
              </div>
            )}
          </div>

          {/* ACCIONES Y BOTÓN DE VER CONVOCATORIA */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
            {/* Fecha de cierre */}
            <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5 w-full sm:w-auto">
              <span>📅</span> 
              <span>Finaliza el: <strong className="text-slate-700">{conv.fechaVencimiento ? new Date(conv.fechaVencimiento).toLocaleDateString() : 'Por definir'}</strong></span>
            </div>

            {/* Botón principal */}
            <a 
              href={conv.enlace} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto text-center bg-transparent hover:bg-[#0F172A] text-[#0F172A] hover:text-white border-2 border-[#0F172A] text-xs font-bold px-6 py-2.5 rounded-xl transition-all shadow-sm"
            >
              📄 VER CONVOCATORIA OFICIAL (PDF)
            </a>
          </div>

        </div>
      ))}
    </div>
  );
}