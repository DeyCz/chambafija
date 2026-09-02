'use client';
import React, { useState, useEffect } from 'react';

// Formatea la hora manual para asegurar compatibilidad universal
const formatTimeStr = (hora) => {
  if (!hora) return '11:59 PM';
  const [h, m] = hora.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const formattedHour = hour % 12 || 12;
  return `${formattedHour}:${m} ${ampm}`;
};

// Formatea Fecha y Hora Elegante (Ej. 02/09/2026 - 03:30 PM)
const formatDateTime = (fecha, hora) => {
  if (!fecha) return '';
  const fechaFormateada = fecha.split('T')[0].split('-').reverse().join('/');
  return `${fechaFormateada} - ${formatTimeStr(hora)}`;
};

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showTerms, setShowTerms] = useState(false);

  const mensaje =
  "¡Hola! ⚡ Quiero publicar un empleo en *Chamba Fija* y encontrar personal al toque 📲🔥";

  const numeroWhatsApp = "51967576214";

  const whatsappUrl =
    `https://api.whatsapp.com/send?phone=${numeroWhatsApp}&text=${encodeURIComponent(mensaje)}`;

  const fetchJobs = async (tipoFiltro) => {
    setLoading(true);
    try {
      const url = tipoFiltro === 'Todos' || tipoFiltro === 'Destacados'
        ? '/api/jobs' 
        : `/api/jobs?tipo=${tipoFiltro}`;
      
      const res = await fetch(url);
      const result = await res.json();
      
      if (result.success) {
        setJobs(result.data);
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs(filter);
  }, [filter]);

  const filteredJobs = jobs.filter(job => {
    // ELIMINACIÓN AUTOMÁTICA CON HORA EXACTA (o 23:59:59 si no se especificó)
    if (job.fechaVencimiento) {
      const [year, month, day] = job.fechaVencimiento.split('T')[0].split('-');
      
      let h = 23, m = 59;
      if (job.horaVencimiento) {
        const [hours, minutes] = job.horaVencimiento.split(':');
        h = parseInt(hours, 10);
        m = parseInt(minutes, 10);
      }

      const fechaExp = new Date(Number(year), Number(month) - 1, Number(day), h, m, 59);
      if (new Date() > fechaExp) {
        return false; // El anuncio expiró y se oculta automáticamente
      }
    }

    const matchesSearch = job.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (job.formacion && job.formacion.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filter === 'Destacados') {
      return matchesSearch && job.esVip;
    }
    return matchesSearch;
  });

  const sortedJobs = [...filteredJobs].sort((a, b) => {
    if (a.tipo === 'Privado' && b.tipo !== 'Privado') return -1;
    if (a.tipo !== 'Privado' && b.tipo === 'Privado') return 1;
    return 0;
  });

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen flex flex-col justify-between font-sans selection:bg-emerald-600 selection:text-white">
      
      <header className="bg-[#0B132B] text-white sticky top-0 z-40 shadow-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          <div className="flex items-center justify-between w-full sm:w-auto">
            <h1 
              className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 group cursor-pointer select-none" 
              onDoubleClick={() => window.location.href = '/admin'}
              title="Panel de Administración"
            >
              <div className="flex items-center justify-between w-full sm:w-auto">
                <a href="/" className="flex items-center gap-2 group cursor-pointer">
                  <img 
                    src="/logo.png" 
                    alt="Chamba Fija Pasco" 
                    className="h-9 sm:h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300" 
                  />
                </a>
              </div>
              <span className="text-[10px] bg-slate-800/90 text-orange-400 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full ml-1 border border-orange-500/30 animate-pulse font-semibold whitespace-nowrap">
                Pasco 🏔️
              </span>
            </h1>
          </div>

          <div className="w-full sm:w-[420px] relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">🔍</span>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar puesto, carrera o empresa..." 
              className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06D6A0] transition-all shadow-inner"
            />
          </div>

          <div className="w-full sm:w-auto flex justify-end">
            <a 
              href={whatsappUrl}      
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto text-center bg-gradient-to-r from-[#06D6A0] to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-slate-950 hover:text-white text-xs font-black px-6 py-3.5 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              💬 Publicar Anuncio
            </a>
          </div>
        </div>
      </header>

      <section className="relative bg-cover bg-[center_bottom_55%] overflow-hidden bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#0B132B] text-white py-14 px-4 text-center shadow-xl" style={{ backgroundImage: "url('/portadav2.png')" }}>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(6,214,160,0.1)_0,transparent_50%)] pointer-events-none"></div>
        <div className="max-w-3xl mx-auto relative z-10 space-y-4">
          <span className="bg-slate-800/90 text-orange-400 text-xs font-bold px-4 py-1.5 rounded-full border border-orange-500/30 inline-flex items-center gap-1.5 shadow-sm backdrop-blur-md animate-pulse">
            ⚡ Empleos formales y convocatorias actualizadas al instante
          </span>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Encuentra tu próxima chamba en <span className="text-[#06D6A0]">Cerro de Pasco</span>
          </h2>
          <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto font-medium">
            Conectando negocios locales y procesos del Estado de forma directa y sin intermediarios.
          </p>
        </div>
      </section>

      <nav className="max-w-6xl mx-auto px-4 py-8 w-full flex flex-wrap gap-3 items-center justify-center sm:justify-start">
        {['Todos', 'Privado', 'Estado', 'Destacados'].map((filtro) => (
          <button 
            key={filtro}
            onClick={() => setFilter(filtro)}
            className={`text-xs px-6 py-3 rounded-2xl font-black transition-all duration-300 shadow-xs ${
              filter === filtro 
                ? 'bg-[#0B132B] text-white shadow-md shadow-slate-900/20 scale-105' 
                : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-700'
            }`}
          >
            {filtro === 'Todos' ? '🔍 Todos' : filtro === 'Privado' ? '🏢 Sector Privado' : filtro === 'Estado' ? '🏛️ Convocatorias Estado' : '⭐ Destacados'}
          </button>
        ))}
      </nav>

      <main className="max-w-6xl mx-auto px-4 pb-24 w-full flex-grow">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-6 border border-slate-200 h-64 animate-pulse flex flex-col justify-between shadow-xs">
                <div className="space-y-4">
                  <div className="w-24 h-6 bg-slate-200 rounded-xl"></div>
                  <div className="w-full h-7 bg-slate-200 rounded-xl"></div>
                  <div className="w-3/4 h-4 bg-slate-200 rounded-lg"></div>
                </div>
                <div className="w-full h-11 bg-slate-200 rounded-2xl"></div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedJobs.length > 0 ? (
              sortedJobs.map((job) => {
                return (
                  <div key={job._id} className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-sm flex flex-col justify-between ${job.esVip ? 'border-amber-400 bg-amber-50/20' : 'border-slate-200'}`}>
                  <div>
                    <div className="flex justify-between items-start mb-3 gap-2">
                      <div className="flex items-center gap-2.5">
                        {job.logo ? (
                          <img src={job.logo} alt={job.empresa} className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 text-sm font-bold flex-shrink-0">
                            {job.tipo === 'Estado' ? '🏛️' : '🏪'}
                          </div>
                        )}
                        <div>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${job.tipo === 'Estado' ? 'bg-blue-100 text-blue-800' : 'bg-orange-100 text-[#FF6B00]'}`}>
                            {job.tipo === 'Estado' ? '🏛️ Público' : '🏪 Privado'}
                          </span>
                          <p className="text-xs text-slate-500 font-bold mt-0.5">{job.empresa}</p>
                        </div>
                      </div>
                      
                      {/* ETIQUETAS ESQUINA SUPERIOR DERECHA (Con Fecha y Hora para Ambos Sectores) */}
                      <div className="flex flex-col items-end gap-1">
                        {job.esVip && <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">⭐ VIP</span>}
                        {job.tipo === 'Estado' && job.fechaVencimiento && (
                          <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                            ⏳ Vence: {formatDateTime(job.fechaVencimiento, job.horaVencimiento)}
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-slate-900 mb-1 leading-snug">
                      {job.titulo}
                    </h3>
                    
                    <p className="text-xs text-slate-600 font-semibold mb-3 flex items-center gap-1">
                      <span>📍</span> <span className="truncate">{job.ubicacion || 'Pasco'}</span>
                    </p>

                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 mb-3">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold">Remuneración:</span>
                        <span className="font-black text-emerald-600">{job.sueldo || 'A tratar'}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-500 font-bold">Modalidad:</span>
                        <span className="font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 truncate max-w-[150px]">{job.modalidad || 'No especificada'}</span>
                      </div>
                      {job.vacantes && (
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold">Vacantes / Plazas:</span>
                          <span className="font-bold text-blue-600">{job.vacantes}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button 
                    onClick={() => setSelectedJob(job)}
                    className="w-full bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    {job.tipo === 'Estado' ? 'VER CONVOCATORIA' : 'Ver Detalles y Postular'}
                  </button>
                </div>
                );
              })
            ) : (
              <div className="col-span-full py-24 text-center text-slate-500 space-y-4">
                <p className="text-lg font-bold text-slate-700">No se encontraron ofertas activas 📉</p>
                <button onClick={() => {setSearchTerm(''); setFilter('Todos');}} className="text-xs bg-emerald-600 text-white px-6 py-3 rounded-2xl font-black shadow-md">
                  Restablecer filtros
                </button>
              </div>
            )}
          </div>
        )}
      </main>

      {/* MODAL DETALLADO */}
      {selectedJob && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] flex flex-col">
            <button 
              onClick={() => setSelectedJob(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-sm font-bold bg-slate-100 hover:bg-slate-200 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
            >
              ✕
            </button>

            <span className={`inline-block text-[10px] font-black px-3.5 py-1.5 rounded-xl mb-3 self-start ${
              selectedJob.tipo === 'Estado' ? 'bg-slate-100 text-slate-800 border border-slate-300' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}>
              {selectedJob.tipo === 'Estado' ? 'Convocatoria Oficial del Estado' : 'Sector Privado Local'}
            </span>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 mb-1 leading-tight">{selectedJob.empresa}: {selectedJob.titulo}</h3>
            <p className="text-xs text-slate-500 font-semibold mb-6 flex items-center gap-1">📍 {selectedJob.ubicacion}</p>

            <div className="overflow-y-auto pr-2 space-y-4 mb-6 text-xs text-slate-700">
              
              {selectedJob.tipo === 'Estado' ? (
                <>
                  <div className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                    <div className="bg-[#0B132B] text-white font-black px-4 py-3">
                      Requisitos del Puesto
                    </div>
                    <div className="p-4 space-y-2.5 font-medium">
                      <p><strong>Número de vacantes:</strong> {selectedJob.vacantes || '1'}</p>
                      {selectedJob.formacion && <p className="whitespace-pre-wrap"><strong>Formación Académica:</strong><br/>{selectedJob.formacion}</p>}
                      {selectedJob.experiencia && <p className="whitespace-pre-wrap"><strong>Experiencia:</strong><br/>{selectedJob.experiencia}</p>}
                      {selectedJob.especializacion && <p className="whitespace-pre-wrap"><strong>Cursos y/o programas: </strong><br/>{selectedJob.especializacion}</p>}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                    <div className="bg-[#0B132B] text-white font-black px-4 py-3">
                      Condiciones del Contrato
                    </div>
                    <div className="p-4 space-y-2.5 font-medium">
                      <p><strong>Lugar de prestación:</strong> { selectedJob.empresa}</p>
                      <p><strong>Remuneración:</strong> <span className="text-emerald-600 font-black">{selectedJob.sueldo ? (selectedJob.sueldo.toString().startsWith('S/') ? selectedJob.sueldo : `S/ ${selectedJob.sueldo}`) : 'A tratar'}</span></p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                    <div className="bg-[#0B132B] text-white font-black px-4 py-3">
                      ¿Cómo postular?
                    </div>
                    <div className="p-4 space-y-2.5 font-medium">
                      {/* SE MUESTRA FECHA Y HORA DE CIERRE PARA EL ESTADO */}
                      <p><strong>Plazo límite:</strong> <span className="font-bold text-red-600">{selectedJob.fechaVencimiento ? formatDateTime(selectedJob.fechaVencimiento, selectedJob.horaVencimiento) : 'Ver cronograma'}</span></p>
                      <p><strong>Procedimiento:</strong> {selectedJob.comoPostular || 'Presentación de expediente según bases oficiales.'}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
                    <div className="bg-[#0B132B] text-white font-black px-4 py-3">
                      Enlaces Oficiales y Bases del Concurso
                    </div>
                    <div className="p-4 space-y-2.5 font-medium">
                      {selectedJob.enlaceBases && (
                        <p>
                          👉 <a href={selectedJob.enlaceBases} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline font-bold">Ver Bases y Convocatoria Completa (PDF)</a>
                        </p>
                      )}
                      
                      {selectedJob.enlacesExtras && selectedJob.enlacesExtras.map((link, idx) => (
                        link.url && (
                          <p key={idx}>
                            👉 <a href={link.url} target="_blank" rel="noreferrer" className="text-emerald-600 hover:underline font-bold">
                              {link.titulo || 'Ver enlace oficial'}
                            </a>
                          </p>
                        )
                      ))}

                      {!selectedJob.enlaceBases && (!selectedJob.enlacesExtras || selectedJob.enlacesExtras.length === 0) && (
                        <p className="text-slate-400 italic">No hay enlaces externos registrados para este proceso.</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-bold">Remuneración:</span>
                    <span className="font-extrabold text-emerald-600">{selectedJob.sueldo || 'A tratar'}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500 font-bold">Modalidad:</span>
                    <span className="font-bold text-slate-800">{selectedJob.modalidad || 'No especificada'}</span>
                  </div>

                                    
                  {selectedJob.experiencia && (
                    <div className="border-b border-slate-200 pb-2">
                      <h4 className="font-bold text-slate-800 mb-1">Experiencia Requerida:</h4>
                      <p className="text-slate-600 leading-relaxed">{selectedJob.experiencia}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-bold text-slate-800 mb-1">Descripción del Puesto:</h4>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">{selectedJob.descripcion}</p>
                  </div>
                </div>
              )}

            </div>

            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button 
                onClick={() => setSelectedJob(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-3.5 rounded-2xl transition-all"
              >
                Cerrar
              </button>
              {selectedJob.tipo === 'Estado' ? (
                <a 
                  href={selectedJob.enlaceBases} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1 text-center bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-black py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  📄 Descargar Bases Oficiales
                </a>
              ) : (
                <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full">
                  {selectedJob.contacto && selectedJob.contacto.split(',').map(c => c.trim()).filter(Boolean).map((num, i, arr) => (
                    <a 
                      key={i}
                      href={`https://wa.me/51${num.replace(/\D/g, '')}?text=Hola,%20vi%20el%20anuncio%20de%20${encodeURIComponent(selectedJob.titulo)}%20en%20ChambaFija`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="w-full flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3.5 px-4 rounded-xl shadow-md transition-all flex items-center justify-center text-center gap-1"
                    >
                      📲 {arr.length === 1 ? 'Contactar por WhatsApp' : `Contactar WhatsApp #${i + 1}`}
                    </a>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {showTerms && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 relative max-h-[85vh] flex flex-col">
            <button 
              onClick={() => setShowTerms(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 text-sm font-bold bg-slate-100 w-9 h-9 rounded-full flex items-center justify-center"
            >
              ✕
            </button>

            <h3 className="text-xl font-black text-slate-900 mb-4">📜 Términos, Condiciones y Descargo de Responsabilidad</h3>
            
            <div className="overflow-y-auto space-y-4 text-xs text-slate-600 pr-2 mb-6 leading-relaxed font-medium">
              <p><strong>1. Naturaleza del Servicio:</strong> ChambaFija es un directorio y espacio publicitario digital independiente que difunde ofertas laborales del sector privado local y convocatorias públicas del Estado en Cerro de Pasco. Operamos estrictamente como un <em>tablón de anuncios clasificados</em>.</p>
              <p><strong>2. Exoneración de Responsabilidad (Disclaimer):</strong> No participamos ni intervenimos en procesos de selección. Las ofertas privadas son responsabilidad exclusiva de los anunciantes. Las convocatorias estatales se enlazan solo con fines informativos desde fuentes oficiales.</p>
              <p><strong>3. Protección de Datos:</strong> ChambaFija <strong>NO recopila ni almacena Currículums Vitae (CV)</strong> de los postulantes. Las postulaciones se realizan de forma directa mediante enlaces externos o WhatsApp proporcionados por los empleadores.</p>
            </div>

            <button 
              onClick={() => setShowTerms(false)}
              className="w-full bg-[#0B132B] hover:bg-slate-800 text-white text-xs font-black py-3.5 rounded-2xl shadow-md"
            >
              Entendido y Cerrar
            </button>
          </div>
        </div>
      )}

      <footer className="bg-[#0F172A] text-slate-400 text-xs px-4 py-8 text-center border-t border-slate-800 mt-auto">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 max-w-lg mx-auto">
            <h4 className="text-white text-base font-extrabold mb-2">🔔 Recibe alertas de empleo diarias en tu celular</h4>
            <p className="text-slate-400 text-xs mb-4">Únete a nuestros canales oficiales y sé el primero en postular a las convocatorias del Estado y negocios locales de Cerro de Pasco.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a href="https://whatsapp.com/channel/0029Vb8NSHbDJ6H4RX6Zqj25" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 px-5 rounded-xl transition-all">
                <svg className="w-5 h-5 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.031 6.172c-3.183 0-5.767 2.584-5.767 5.767 0 1.01.265 1.959.728 2.782l-.764 2.788 2.859-.751c.789.434 1.708.683 2.684.683 3.183 0 5.767-2.584 5.767-5.767 0-3.183-2.584-5.767-5.767-5.767zm3.322 8.167c-.139.39-.811.722-1.116.768-.291.045-.658.082-1.066-.051-.247-.079-.564-.183-.969-.356-1.712-.738-2.831-2.482-2.918-2.599-.087-.117-.696-.927-.696-1.769 0-.842.439-1.256.595-1.427.156-.171.341-.214.455-.214.114 0 .228.003.328.012.105.01.246-.039.384.292.139.332.476 1.157.518 1.242.043.085.072.185.014.299-.058.114-.087.185-.173.285-.086.1-.182.224-.26.3-.087.087-.179.182-.077.356.101.174.45 0.744.966 1.206.666.595 1.228.779 1.402.868.174.089.277.074.38-.043.103-.117.442-.514.56-.69.117-.176.234-.148.39-.09 0.156.058 1.001.472 1.173.558.172.086.287.129.329.2.043.071.043.413-.096.803z"/>
                </svg>
                Canal de WhatsApp
              </a>
              <a href="https://t.me/Chamba_Fija" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-400 text-white font-bold py-2.5 px-5 rounded-xl transition-all">
                <svg className="w-5 h-5 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.12.03-1.99 1.27-5.62 3.72-.53.36-1.01.54-1.44.53-.47-.02-1.37-.26-2.03-.48-.82-.27-1.47-.42-1.42-.88.03-.25.38-.51 1.05-.78 4.1-1.78 6.84-2.95 8.22-3.51 3.91-1.63 4.72-1.92 5.25-1.93.12 0 .39.03.57.18.15.12.19.28.21.4-.01.07.01.35-.06.7z"/>
                </svg>
                Canal de Telegram
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-black text-white text-sm">ChambaFija - Cerro de Pasco</p>
            <p className="leading-relaxed text-slate-400 max-w-2xl mx-auto font-medium opacity-90">
              ChambaFija es un espacio de difusión informativo independiente (tablón de anuncios clasificados). No participamos en los procesos de selección ni manejamos bases de datos de postulantes.
            </p>
            <div>
              <button 
                onClick={() => setShowTerms(true)}
                className="text-[#06D6A0] hover:underline font-extrabold text-xs bg-transparent border-none cursor-pointer transition-all"
              >
                Ver Términos y Condiciones
              </button>
            </div>
            <p className="text-[11px] text-slate-500 pt-2 opacity-75">© 2026 ChambaFija. Todos los derechos reservados. <a href="/Panel08" className="text-[10px] text-slate-700 hover:text-slate-500 transition-colors">·</a></p>
          </div>
        </div>
      </footer>

    </div>
  );
}