'use client';
import React, { useState, useEffect } from 'react';

export default function Home() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [showTerms, setShowTerms] = useState(false);

  const fetchJobs = async (tipoFiltro) => {
    setLoading(true);
    try {
      const url = tipoFiltro === 'Todos' || tipoFiltro === 'Destacados'
        ? 'https://chambafija-backend.onrender.com/api/jobs' 
        : `https://chambafija-backend.onrender.com/api/jobs?tipo=${tipoFiltro}`;
      
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
    const matchesSearch = job.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (job.formacion && job.formacion.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filter === 'Destacados') {
      return matchesSearch && job.esVip;
    }
    return matchesSearch;
  });

  return (
    <div className="bg-[#F8FAFC] text-slate-900 min-h-screen flex flex-col justify-between font-sans selection:bg-emerald-600 selection:text-white">
      
      {/* CABECERA CON AZUL MARINO PROFUNDO */}
      <header className="bg-[#0B132B] text-white sticky top-0 z-40 shadow-xl border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          
          {/* LOGO */}
          <div className="flex items-center justify-between w-full sm:w-auto">
            <h1 
              className="text-xl text-2xl font-black tracking-tight flex items-center gap-2 group cursor-pointer select-none" 
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

          {/* BUSCADOR MODERNO */}
          <div className="w-full sm:w-[420px] relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-400">🔍</span>
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar puesto, carrera, empresa o DIRESA..." 
              className="w-full pl-11 pr-4 py-3 text-sm rounded-2xl bg-slate-900 border border-slate-700 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#06D6A0] transition-all shadow-inner"
            />
          </div>

          {/* BOTÓN CTA CON ESMERALDA */}
          <div className="w-full sm:w-auto flex justify-end">
            <a 
              href="https://wa.me/51999999999?text=Hola,%20quiero%20publicar%20un%20anuncio%20en%20ChambaFija" 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full sm:w-auto text-center bg-gradient-to-r from-[#06D6A0] to-emerald-600 hover:from-emerald-500 hover:to-emerald-700 text-slate-950 hover:text-white text-xs font-black px-6 py-3.5 rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 active:translate-y-0"
            >
              💬 Publicar Anuncio Gratis
            </a>
          </div>
        </div>
      </header>

      {/* HERO BANNER INSTITUCIONAL */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0B132B] via-[#1C2541] to-[#0B132B] text-white py-14 px-4 text-center shadow-xl">
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

      {/* FILTROS RÁPIDOS EN PÍLDORAS */}
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

      {/* CONTENIDO PRINCIPAL */}
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
            {filteredJobs.length > 0 ? (
              filteredJobs.map((job) => {
                const isEstado = job.tipo === 'Estado';
                return (
                  <div 
                    key={job._id} 
                    className={`bg-white rounded-3xl p-6 border transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col justify-between relative group ${
                      job.esVip 
                        ? 'border-emerald-400 bg-gradient-to-b from-white via-white to-emerald-50/40 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-400/40' 
                        : isEstado 
                          ? 'border-slate-300 hover:border-emerald-500 shadow-sm' 
                          : 'border-slate-200/80 hover:border-slate-300 shadow-sm'
                    }`}
                  >
                    <div>
                      {/* ETIQUETAS SUPERIORES */}
                      <div className="flex justify-between items-center mb-4">
                        <span className={`text-[10px] font-black px-3.5 py-1.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 ${
                          isEstado 
                            ? 'bg-slate-100 text-slate-800 border border-slate-300' 
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}>
                          {isEstado ? '🏛️ Convocatoria Pública' : '🏪 Negocio Local'}
                        </span>
                        {job.esVip && (
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center gap-1">
                            ⭐ VIP
                          </span>
                        )}
                      </div>

                      {/* TÍTULO Y EMPRESA */}
                      <h3 className="text-base font-black text-slate-900 mb-1.5 leading-snug group-hover:text-emerald-700 transition-colors">
                        {isEstado ? `${job.empresa}: ${job.titulo}` : job.titulo}
                      </h3>
                      
                      <p className="text-xs text-slate-500 font-semibold mb-4 flex items-center gap-1.5">
                        📍 <span className="text-slate-800 font-bold">{job.empresa}</span> — <span className="text-slate-400">{job.ubicacion || 'Pasco'}</span>
                      </p>
                      
                      {/* DISEÑO INTERNO */}
                      {isEstado ? (
                        <div className="space-y-2.5 mb-6">
                          {job.formacion && (
                            <div className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                              <span className="text-slate-900 block text-[10px] uppercase font-black mb-0.5 tracking-wide">🎓 Formación:</span>
                              <span className="line-clamp-2 font-medium">{job.formacion}</span>
                            </div>
                          )}
                          <div className="flex items-center justify-between text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200 font-bold">
                            <span className="text-slate-500">Plazas: <strong className="text-slate-900">{job.vacantes || '1'}</strong></span>
                            <span className="font-black text-emerald-600 text-sm">{job.sueldo ? (job.sueldo.toString().startsWith('S/') ? job.sueldo : `S/ ${job.sueldo}`) : 'Sueldo a tratar'}</span>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl mb-4 border border-slate-200">
                            <span className="text-xs font-black text-emerald-600 text-sm">{job.sueldo ? (job.sueldo.toString().startsWith('S/') ? job.sueldo : `S/ ${job.sueldo}`) : 'Sueldo a tratar'}</span>
                            <span className="text-[11px] font-extrabold text-slate-700 bg-white px-3 py-1 rounded-xl border border-slate-200 shadow-xs">{job.modalidad}</span>
                          </div>
                          <p className="text-xs text-slate-600 line-clamp-2 mb-6 leading-relaxed font-medium">{job.descripcion}</p>
                        </>
                      )}
                    </div>

                    {/* BOTÓN DE ACCIÓN */}
                    <button 
                      onClick={() => setSelectedJob(job)}
                      className={`w-full text-xs font-black py-3.5 rounded-2xl transition-all duration-300 shadow-sm flex items-center justify-center gap-2 active:scale-95 ${
                        isEstado
                          ? 'bg-[#0B132B] hover:bg-slate-800 text-white shadow-slate-900/10'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                      }`}
                    >
                      {isEstado ? '📄 Ver Convocatoria Completa' : 'Ver Detalles y Postular'}
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
                      {selectedJob.formacion && <p><strong>Formación Académica:</strong> {selectedJob.formacion}</p>}
                      {selectedJob.experiencia && <p><strong>Experiencia:</strong> {selectedJob.experiencia}</p>}
                      {selectedJob.especializacion && <p><strong>Cursos y/o programas:</strong> {selectedJob.especializacion}</p>}
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                    <div className="bg-[#0B132B] text-white font-black px-4 py-3">
                      Condiciones del Contrato
                    </div>
                    <div className="p-4 space-y-2.5 font-medium">
                      <p><strong>Lugar de prestación:</strong> {selectedJob.lugarPrestacion || selectedJob.empresa}</p>
                      <p><strong>Remuneración:</strong> <span className="text-emerald-600 font-black">{selectedJob.sueldo ? (selectedJob.sueldo.toString().startsWith('S/') ? selectedJob.sueldo : `S/ ${selectedJob.sueldo}`) : 'A tratar'}</span> ({selectedJob.modalidad})</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-2xl border border-slate-200/80 overflow-hidden shadow-2xs">
                    <div className="bg-[#0B132B] text-white font-black px-4 py-3">
                      ¿Cómo postular?
                    </div>
                    <div className="p-4 space-y-2.5 font-medium">
                      <p><strong>Plazo límite:</strong> {selectedJob.fechaVencimiento ? new Date(selectedJob.fechaVencimiento).toLocaleDateString() : 'Ver cronograma'}</p>
                      <p><strong>Procedimiento:</strong> {selectedJob.comoPostular || 'Presentación de expediente según bases oficiales.'}</p>
                    </div>
                  </div>

                  {/* BLOQUE DINÁMICO DE ENLACES OFICIALES EN EL MODAL */}
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
                      
                      {/* Mapeo de enlaces extras si fueron agregados */}
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
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-3 shadow-2xs">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-200">
                    <span className="text-slate-500 font-bold">Remuneración:</span>
                    <span className="font-black text-emerald-600 text-base">{selectedJob.sueldo ? (selectedJob.sueldo.toString().startsWith('S/') ? selectedJob.sueldo : `S/ ${selectedJob.sueldo}`) : 'A tratar'}</span>
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 mb-1">Descripción del Puesto:</h4>
                    <p className="text-slate-600 leading-relaxed font-medium">{selectedJob.descripcion}</p>
                  </div>
                </div>
              )}

            </div>

            {/* BOTONES DE ACCIÓN */}
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
                <a 
                  href={`https://wa.me/51${selectedJob.contacto}?text=Hola,%20vi%20el%20anuncio%20de%20${selectedJob.titulo}%20en%20ChambaFija`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex-1 text-center bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black py-3.5 rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  📲 Contactar por WhatsApp
                </a>
              )}
            </div>

          </div>
        </div>
      )}

      {/* MODAL DE TÉRMINOS Y CONDICIONES */}
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

      {/* FOOTER */}
      <footer className="bg-[#0B132B] text-slate-300 text-xs px-4 py-12 text-center border-t border-slate-800 mt-auto">
        <div className="max-w-4xl mx-auto space-y-4">
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
      </footer>

    </div>
  );
}