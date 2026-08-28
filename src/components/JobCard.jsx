import React from 'react';

export default function JobCard({ job, onOpenDetail }) {
  const esEstado = job.tipo === 'Estado';

  return (
    <div className={`bg-white p-5 rounded-2xl shadow-sm hover:shadow-xl border relative flex flex-col justify-between transition-all duration-300 hover:-translate-y-1.5 group ${job.esVip ? 'border-2 border-amber-400/90 shadow-amber-400/10' : 'border-slate-200'}`}>
      
      {job.esVip && (
        <span className="absolute -top-3 right-4 bg-amber-400 text-slate-900 text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-sm">
          ⭐ DESTACADO
        </span>
      )}

      <div>
        <div className="flex justify-between items-start mb-2">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${esEstado ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-[#FF6B00]'}`}>
            {esEstado ? 'Estado' : 'Sector Privado'}
          </span>
          <span className="text-[11px] text-slate-400 font-medium">Hace un momento</span>
        </div>

        <h3 className={`font-bold text-base text-slate-900 transition-colors cursor-pointer ${esEstado ? 'group-hover:text-blue-600' : 'group-hover:text-[#FF6B00]'}`} onClick={() => onOpenDetail(job)}>
          {job.titulo}
        </h3>
        
        <p className="text-xs text-slate-600 font-medium mt-1">{job.empresa} • {job.ubicacion}</p>
        
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-semibold">{job.sueldo}</span>
          <span className="bg-slate-100 text-slate-700 text-xs px-2.5 py-1 rounded-lg font-medium">{job.modalidad}</span>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
        <button 
          onClick={() => onOpenDetail(job)}
          className="flex-1 text-center bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-2.5 rounded-xl transition-all"
        >
          Ver más
        </button>
        <a 
          href={job.enlace} 
          target="_blank" 
          rel="noopener noreferrer" 
          className={`flex-1 text-center text-xs font-bold py-2.5 rounded-xl transition-all shadow-md ${esEstado ? 'bg-[#0F172A] hover:bg-slate-800 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-emerald-600/20'}`}
        >
          {esEstado ? 'Postular' : 'WhatsApp'}
        </a>
      </div>

    </div>
  );
}