"use client";
import React, { useState, useEffect } from 'react';

const API_URL = 'https://chambafija-backend.onrender.com/api/jobs';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('estado');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    tipo: 'Estado',
    titulo: '',
    empresa: '',
    ubicacion: 'Chaupimarca, Pasco',
    sueldo: '',
    modalidad: 'CAS',
    descripcion: '',
    vacantes: '1',
    formacion: '',
    experiencia: '',
    especializacion: '',
    lugarPrestacion: 'Gobierno Regional Pasco',
    comoPostular: 'Presentación de Curriculum Vitae documentado por Mesa de Partes.',
    enlaceBases: '',
    enlacesExtras: [{ titulo: '', url: '' }],
    contacto: '',
    fechaVencimiento: '',
    esVip: false
  });

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const tipoQuery = activeTab === 'estado' ? 'Estado' : 'Privado';
      const res = await fetch(`${API_URL}?tipo=${tipoQuery}`);
      const result = await res.json();
      if (result.success) setJobs(result.data);
    } catch (error) {
      console.error("Error al cargar empleos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setFormData(prev => ({ ...prev, tipo: activeTab === 'estado' ? 'Estado' : 'Privado' }));
    fetchJobs();
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleExtraLinkChange = (index, field, value) => {
    const nuevosEnlaces = [...formData.enlacesExtras];
    nuevosEnlaces[index][field] = value;
    setFormData({ ...formData, enlacesExtras: nuevosEnlaces });
  };

  const agregarFilaEnlace = () => {
    setFormData({
      ...formData,
      enlacesExtras: [...formData.enlacesExtras, { titulo: '', url: '' }]
    });
  };

  const eliminarFilaEnlace = (index) => {
    const nuevosEnlaces = formData.enlacesExtras.filter((_, i) => i !== index);
    setFormData({ ...formData, enlacesExtras: nuevosEnlaces });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const sueldoLimpio = formData.sueldo 
        ? (formData.sueldo.toString().startsWith('S/') ? formData.sueldo : `S/ ${formData.sueldo}`) 
        : 'A tratar';

      const datosAEnviar = { ...formData, sueldo: sueldoLimpio };
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datosAEnviar)
      });
      const result = await res.json();

      if (result.success) {
        alert(editingId ? '¡Actualizado correctamente!' : '¡Publicado con éxito!');
        resetForm();
        fetchJobs();
      } else {
        alert('Error: ' + result.mensaje);
      }
    } catch (error) {
      alert('Error de conexión con el servidor.');
    }
  };

  const handleEdit = (job) => {
    setEditingId(job._id);
    setFormData({
      tipo: job.tipo || 'Estado',
      titulo: job.titulo || '',
      empresa: job.empresa || '',
      ubicacion: job.ubicacion || 'Chaupimarca, Pasco',
      sueldo: job.sueldo || '',
      modalidad: job.modalidad || '',
      descripcion: job.descripcion || '',
      vacantes: job.vacantes || '1',
      formacion: job.formacion || '',
      experiencia: job.experiencia || '',
      especializacion: job.especializacion || '',
      lugarPrestacion: job.lugarPrestacion || '',
      comoPostular: job.comoPostular || '',
      enlaceBases: job.enlaceBases || '',
      enlacesExtras: job.enlacesExtras || [{ titulo: '', url: '' }],
      contacto: job.contacto || '',
      fechaVencimiento: job.fechaVencimiento ? job.fechaVencimiento.split('T')[0] : '',
      esVip: job.esVip || false
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este registro?')) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
      fetchJobs();
    } catch (error) {
      alert('Error al eliminar.');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      tipo: activeTab === 'estado' ? 'Estado' : 'Privado',
      titulo: '',
      empresa: '',
      ubicacion: 'Chaupimarca, Pasco',
      sueldo: '',
      modalidad: activeTab === 'estado' ? 'CAS' : 'Tiempo Completo',
      descripcion: '',
      vacantes: '1',
      formacion: '',
      experiencia: '',
      especializacion: '',
      lugarPrestacion: 'Gobierno Regional Pasco',
      comoPostular: 'Presentación de Curriculum Vitae documentado por Mesa de Partes.',
      enlaceBases: '',
      enlacesExtras: [{ titulo: '', url: '' }],
      contacto: '',
      fechaVencimiento: '',
      esVip: false
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-6 font-sans">
      
      {/* PESTAÑAS DE NAVEGACIÓN SUPERIOR */}
      <div className="max-w-6xl mx-auto flex gap-4 mb-6">
        <button 
          onClick={() => setActiveTab('estado')}
          className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-sm transition-all shadow-sm ${
            activeTab === 'estado' 
              ? 'bg-[#0B132B] text-white shadow-md' 
              : 'bg-white text-[#0B132B] border border-slate-300 hover:bg-slate-100'
          }`}
        >
          🏛️ Convocatorias del Estado (Públicas)
        </button>
        <button 
          onClick={() => setActiveTab('privado')}
          className={`flex-1 py-3.5 px-6 rounded-2xl font-black text-sm transition-all shadow-sm ${
            activeTab === 'privado' 
              ? 'bg-[#06D6A0] text-slate-950 shadow-md' 
              : 'bg-white text-[#0B132B] border border-slate-300 hover:bg-slate-100'
          }`}
        >
          🏪 Negocios Locales (Privados)
        </button>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* FORMULARIO DE REGISTRO */}
        <div className="bg-white p-6 rounded-3xl border border-slate-300 shadow-sm">
          <div className="mb-4 pb-3 border-b border-slate-200">
            <h2 className="text-base font-black text-[#0B132B]">
              {editingId ? '✏️ Modificar Registro' : (activeTab === 'estado' ? '🏛️ Nueva Convocatoria Estatal' : '🏪 Nuevo Anuncio Local')}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            {activeTab === 'estado' ? (
              <>
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-black text-slate-900">Entidad Pública</label>
                    <input type="text" name="empresa" value={formData.empresa} onChange={handleChange} placeholder="Ej. Gobierno Regional de Pasco" className="p-2.5 rounded-xl border border-slate-400 text-slate-900 bg-slate-50 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[#06D6A0] outline-none" required />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-black text-slate-900">Modalidad</label>
                    <select name="modalidad" value={formData.modalidad} onChange={handleChange} className="p-2.5 rounded-xl border border-slate-400 text-slate-900 bg-slate-50 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[#06D6A0] outline-none">
                      <option value="CAS">CAS</option>
                      <option value="728">D.L. 728</option>
                      <option value="276">D.L. 276</option>
                      <option value="Locación">Locación</option>
                      <option value="Prácticas">Prácticas</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black text-slate-900">Título del Puesto / Perfil</label>
                  <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Ej. Asistente Administrativo I" className="p-2.5 rounded-xl border border-slate-400 text-slate-900 bg-slate-50 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[#06D6A0] outline-none" required />
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-black text-slate-900">Ubicación / Distrito</label>
                    <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleChange} placeholder="Ej. Chaupimarca, Pasco" className="p-2.5 rounded-xl border border-slate-400 text-slate-900 bg-slate-50 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[#06D6A0] outline-none" required />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-black text-slate-900">Vacantes</label>
                    <input type="number" name="vacantes" value={formData.vacantes} onChange={handleChange} className="p-2.5 rounded-xl border border-slate-400 text-slate-900 bg-slate-50 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[#06D6A0] outline-none" />
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-black text-slate-900">Remuneración (S/)</label>
                    <input type="number" name="sueldo" value={formData.sueldo} onChange={handleChange} placeholder="Ej. 2500" className="p-2.5 rounded-xl border border-slate-400 text-slate-900 bg-slate-50 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[#06D6A0] outline-none" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-black text-slate-900">Fecha Límite (Cierre)</label>
                    <input type="date" name="fechaVencimiento" value={formData.fechaVencimiento} onChange={handleChange} className="p-2.5 rounded-xl border border-slate-400 text-slate-900 bg-slate-50 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[#06D6A0] outline-none" />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black text-slate-900">Formación Académica</label>
                  <input type="text" name="formacion" value={formData.formacion} onChange={handleChange} placeholder="Ej. TÍTULO EN DERECHO..." className="p-2.5 rounded-xl border border-slate-400 text-slate-900 bg-slate-50 font-medium text-sm focus:bg-white focus:ring-2 focus:ring-[#06D6A0] outline-none" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black text-slate-900">Experiencia Requerida</label>
                  <textarea name="experiencia" value={formData.experiencia} onChange={handleChange} placeholder="Ej. Experiencia general de 2 años..." className="p-2.5 rounded-xl border border-slate-400 text-slate-900 bg-slate-50 font-medium text-sm h-14 focus:bg-white focus:ring-2 focus:ring-[#06D6A0] outline-none" />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black text-slate-900">¿Cómo postular?</label>
                  <textarea name="comoPostular" value={formData.comoPostular} onChange={handleChange} placeholder="Instrucciones..." className="p-2.5 rounded-xl border border-slate-400 text-slate-900 bg-slate-50 font-medium text-sm h-14 focus:bg-white focus:ring-2 focus:ring-[#06D6A0] outline-none" />
                </div>

                {/* BLOQUE DE ENLACES MÚLTIPLES */}
                <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-300 flex flex-col gap-2">
                  <label className="text-xs font-black text-[#0B132B]">🔗 Enlaces Oficiales (Bases, Comunicados, Resultados)</label>
                  <input type="url" name="enlaceBases" value={formData.enlaceBases} onChange={handleChange} placeholder="Enlace principal de Bases (PDF)" className="p-2.5 rounded-xl border border-slate-400 text-slate-900 bg-white font-medium text-sm outline-none" />

                  {formData.enlacesExtras.map((item, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        placeholder="Título (Ej. Comunicado N° 01)" 
                        value={item.titulo} 
                        onChange={(e) => handleExtraLinkChange(index, 'titulo', e.target.value)} 
                        className="p-2.5 rounded-xl border border-slate-400 text-slate-900 bg-white font-medium text-sm flex-1 outline-none" 
                      />
                      <input 
                        type="url" 
                        placeholder="URL https://..." 
                        value={item.url} 
                        onChange={(e) => handleExtraLinkChange(index, 'url', e.target.value)} 
                        className="p-2.5 rounded-xl border border-slate-400 text-slate-900 bg-white font-medium text-sm flex-2 outline-none" 
                      />
                      <button type="button" onClick={() => eliminarFilaEnlace(index)} className="text-red-600 font-bold px-2 py-1 hover:bg-red-50 rounded-lg">✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={agregarFilaEnlace} className="text-emerald-700 font-black text-xs text-left mt-1 hover:underline">+ Agregar otro enlace institucional</button>
                </div>
              </>
            ) : (
              <>
                <div className="flex gap-3">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-black text-slate-900">Nombre del Negocio</label>
                    <input type="text" name="empresa" value={formData.empresa} onChange={handleChange} placeholder="Ej. Pollería Kimbos" className="p-2.5 rounded-xl border border-slate-400 text-slate-900 bg-slate-50 font-medium text-sm outline-none" required />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-black text-slate-900">Ubicación</label>
                    <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleChange} placeholder="Ej. Yanacancha, Pasco" className="p-2.5 rounded-xl border border-slate-400 text-slate-900 bg-slate-50 font-medium text-sm outline-none" required />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-xs font-black text-slate-900">Puesto Requerido</label>
                  <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Ej. Mozo / Ayudante" className="p-2.5 rounded-xl border border-slate-400 text-slate-900 bg-slate-50 font-medium text-sm outline-none" required />
                </div>

                <div className="flex gap-3">
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-black text-slate-900">Sueldo (S/)</label>
                    <input type="number" name="sueldo" value={formData.sueldo} onChange={handleChange} placeholder="Ej. 1200" className="p-2.5 rounded-xl border border-slate-400 text-slate-900 bg-slate-50 font-medium text-sm outline-none" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs font-black text-slate-900">WhatsApp de Contacto</label>
                    <input type="text" name="contacto" value={formData.contacto} onChange={handleChange} placeholder="Ej. 987654321" className="p-2.5 rounded-xl border border-slate-400 text-slate-900 bg-slate-50 font-medium text-sm outline-none" required />
                  </div>
                </div>
              </>
            )}

            <div className="flex flex-col gap-1">
              <label className="text-xs font-black text-slate-900">Descripción / Notas</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} className="p-2.5 rounded-xl border border-slate-400 text-slate-900 bg-slate-50 font-medium text-sm h-16 outline-none" />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-300">
              <input type="checkbox" id="esVip" name="esVip" checked={formData.esVip} onChange={handleChange} className="w-4 h-4 accent-emerald-600" />
              <label htmlFor="esVip" className="text-xs font-black text-emerald-900 cursor-pointer">⭐ Destacar Anuncio (VIP)</label>
            </div>

            <div className="flex gap-2 mt-2">
              <button type="submit" className="flex-1 py-3 bg-[#0B132B] hover:bg-slate-900 text-white rounded-xl font-black text-sm shadow-md transition-all">
                {editingId ? 'Guardar Cambios' : 'Publicar Anuncio'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="py-3 px-5 bg-slate-500 hover:bg-slate-600 text-white rounded-xl font-black text-sm transition-all">
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* LISTADO DE REGISTROS ACTIVOS */}
        <div className="bg-white p-6 rounded-3xl border border-slate-300 shadow-sm flex flex-col h-fit">
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
            <h2 className="text-base font-black text-[#0B132B]">📋 Registros Activos</h2>
            <span className="text-xs font-black bg-slate-100 text-slate-800 px-3 py-1 rounded-full border border-slate-300">{jobs.length} ofertas</span>
          </div>

          <div className="flex flex-col gap-3 max-h-[700px] overflow-y-auto pr-1">
            {jobs.map((job) => (
              <div key={job._id} className="p-4 rounded-2xl bg-white border border-slate-300 shadow-2xs hover:border-slate-400 transition-all flex flex-col gap-2">
                <div>
                  <span className="text-[10px] font-black uppercase bg-[#0B132B] text-white px-2.5 py-1 rounded-md">{job.modalidad || job.tipo}</span>
                  <h3 className="text-sm font-black text-slate-900 mt-2">{job.titulo}</h3>
                  <p className="text-xs text-slate-600 font-bold mt-0.5"><strong>{job.empresa}</strong> • 📍 {job.ubicacion}</p>
                </div>
                <div className="flex justify-between items-center pt-2.5 border-t border-slate-100">
                  <span className="text-sm font-black text-emerald-700">{job.sueldo || 'A tratar'}</span>
                  <div className="flex gap-2">
                    <button 
                        onClick={() => {
                          const url = `https://chambafija.vercel.app/oferta/${job._id}`;
                          const text = `🚨 *Nueva Oferta en ChambaFija*\n🏢 ${job.empresa}\n💼 ${job.titulo}\n💰 ${job.sueldo}\n📍 ${job.ubicacion}\n\n👉 Postula aquí: ${url}`;
                          window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                        }} 
                        style={{...styles.btnEdit, backgroundColor: '#10B981', color: 'white', borderColor: '#059669'}}
                      >
                        Compartir
                      </button>
                    <button onClick={() => handleEdit(job)} className="px-3 py-1.5 text-xs font-black bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg border border-slate-300 transition-all">Editar</button>
                    <button onClick={() => handleDelete(job._id)} className="px-3 py-1.5 text-xs font-black bg-red-50 hover:bg-red-100 text-red-700 rounded-lg border border-red-200 transition-all">Eliminar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}