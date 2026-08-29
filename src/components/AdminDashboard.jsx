"use client";
import React, { useState, useEffect } from 'react';

// Conexión corregida hacia tu backend en la nube
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

    const handleShare = (job) => {
    const baseUrl = window.location.origin;
    const shareUrl = `${baseUrl}/oferta/${job._id || job.id}`;
    const shareText = `🚨 *Nueva Oferta en ChambaFija*\n🏢 ${job.empresa}\n💼 ${job.titulo}\n💰 ${job.sueldo || 'A tratar'}\n📍 ${job.ubicacion}\n\n👉 Postula aquí: ${shareUrl}`;

    // 1. Si es un dispositivo móvil compatible, usa el menú nativo del celular
    if (typeof navigator !== 'undefined' && navigator.share) {
        navigator.share({
        title: job.titulo,
        text: shareText,
        url: shareUrl,
        }).catch((error) => console.log('Error al compartir:', error));
    } else {
        // 2. Si es una PC o el navegador no soporta share(), abre WhatsApp Web directamente
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
    }
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
    <div style={styles.wrapper}>
      <div style={styles.tabNav}>
        <button 
          onClick={() => setActiveTab('estado')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'estado' ? '#0B132B' : '#FFFFFF',
            color: activeTab === 'estado' ? '#FFFFFF' : '#0B132B',
            borderColor: activeTab === 'estado' ? '#0B132B' : '#CBD5E1',
          }}
        >
          🏛️ Convocatorias del Estado (Públicas)
        </button>
        <button 
          onClick={() => setActiveTab('privado')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'privado' ? '#06D6A0' : '#FFFFFF',
            color: activeTab === 'privado' ? '#0B132B' : '#0B132B',
            borderColor: activeTab === 'privado' ? '#06D6A0' : '#CBD5E1',
          }}
        >
          🏪 Negocios Locales (Privados)
        </button>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              {editingId ? '✏️ Modificar Registro' : (activeTab === 'estado' ? '🏛️ Nueva Convocatoria Estatal' : '🏪 Nuevo Anuncio Local')}
            </h2>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {activeTab === 'estado' ? (
              <>
                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Entidad Pública</label>
                    <input type="text" name="empresa" value={formData.empresa} onChange={handleChange} placeholder="Ej. Gobierno Regional de Pasco" style={styles.input} required />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Modalidad</label>
                    <select name="modalidad" value={formData.modalidad} onChange={handleChange} style={styles.input}>
                      <option value="CAS">CAS</option>
                      <option value="728">D.L. 728</option>
                      <option value="276">D.L. 276</option>
                      <option value="Locación">Locación</option>
                      <option value="Prácticas">Prácticas</option>
                    </select>
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Título del Puesto / Perfil</label>
                  <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Ej. Asistente Administrativo I" style={styles.input} required />
                </div>

                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Ubicación / Distrito</label>
                    <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleChange} placeholder="Ej. Chaupimarca, Pasco" style={styles.input} required />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Vacantes</label>
                    <input type="number" name="vacantes" value={formData.vacantes} onChange={handleChange} style={styles.input} />
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Remuneración (S/)</label>
                    <input type="number" name="sueldo" value={formData.sueldo} onChange={handleChange} placeholder="Ej. 2500" style={styles.input} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Fecha Límite (Cierre)</label>
                    <input type="date" name="fechaVencimiento" value={formData.fechaVencimiento} onChange={handleChange} style={styles.input} />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Formación Académica</label>
                  <input type="text" name="formacion" value={formData.formacion} onChange={handleChange} placeholder="Ej. TÍTULO EN DERECHO..." style={styles.input} />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Experiencia Requerida</label>
                  <textarea name="experiencia" value={formData.experiencia} onChange={handleChange} placeholder="Ej. Experiencia general de 2 años..." style={{ ...styles.input, height: '50px' }} />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>¿Cómo postular?</label>
                  <textarea name="comoPostular" value={formData.comoPostular} onChange={handleChange} placeholder="Instrucciones..." style={{ ...styles.input, height: '50px' }} />
                </div>

                <div style={{ ...styles.field, backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <label style={{ ...styles.label, marginBottom: '6px', color: '#0B132B' }}>🔗 Enlaces Oficiales (Bases, Comunicados, Resultados)</label>
                  <div style={{ marginBottom: '8px' }}>
                    <input type="url" name="enlaceBases" value={formData.enlaceBases} onChange={handleChange} placeholder="Enlace principal de Bases (PDF)" style={{ ...styles.input, marginBottom: '6px' }} />
                  </div>

                  {formData.enlacesExtras.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '6px', marginBottom: '6px' }}>
                      <input 
                        type="text" 
                        placeholder="Título (Ej. Comunicado N° 01)" 
                        value={item.titulo} 
                        onChange={(e) => handleExtraLinkChange(index, 'titulo', e.target.value)} 
                        style={{ ...styles.input, flex: 1 }} 
                      />
                      <input 
                        type="url" 
                        placeholder="URL https://..." 
                        value={item.url} 
                        onChange={(e) => handleExtraLinkChange(index, 'url', e.target.value)} 
                        style={{ ...styles.input, flex: 2 }} 
                      />
                      <button type="button" onClick={() => eliminarFilaEnlace(index)} style={styles.btnDeleteRow}>✕</button>
                    </div>
                  ))}
                  <button type="button" onClick={agregarFilaEnlace} style={styles.btnAddRow}>+ Agregar otro enlace institucional</button>
                </div>
              </>
            ) : (
              <>
                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Nombre del Negocio</label>
                    <input type="text" name="empresa" value={formData.empresa} onChange={handleChange} placeholder="Ej. Pollería Kimbos" style={styles.input} required />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Ubicación</label>
                    <input type="text" name="ubicacion" value={formData.ubicacion} onChange={handleChange} placeholder="Ej. Yanacancha, Pasco" style={styles.input} required />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Puesto Requerido</label>
                  <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Ej. Mozo / Ayudante" style={styles.input} required />
                </div>

                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Sueldo (S/)</label>
                    <input type="number" name="sueldo" value={formData.sueldo} onChange={handleChange} placeholder="Ej. 1200" style={styles.input} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>WhatsApp de Contacto</label>
                    <input type="text" name="contacto" value={formData.contacto} onChange={handleChange} placeholder="Ej. 987654321" style={styles.input} required />
                  </div>
                </div>
              </>
            )}

            <div style={styles.field}>
              <label style={styles.label}>Descripción / Notas</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} style={{ ...styles.input, height: '60px' }} />
            </div>

            <div style={styles.vipContainer}>
              <input type="checkbox" id="esVip" name="esVip" checked={formData.esVip} onChange={handleChange} />
              <label htmlFor="esVip" style={styles.vipLabel}>⭐ Destacar Anuncio (VIP)</label>
            </div>

            <div style={styles.btnGroup}>
              <button type="submit" style={styles.btnPrimary}>
                {editingId ? 'Guardar Cambios' : 'Publicar Anuncio'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} style={styles.btnSecondary}>Cancelar</button>
              )}
            </div>
          </form>
        </div>

        <div style={styles.card}>
          <div style={styles.listHeader}>
            <h2 style={styles.cardTitle}>📋 Registros Activos</h2>
            <span style={styles.counterBadge}>{jobs.length} ofertas</span>
          </div>

          <div style={styles.scrollList}>
            {jobs.map((job) => (
              <div key={job._id} style={styles.itemCard}>
                <div>
                  <span style={styles.tagModality}>{job.modalidad || job.tipo}</span>
                  <h3 style={styles.itemTitle}>{job.titulo}</h3>
                  <p style={styles.itemMeta}><strong>{job.empresa}</strong> • 📍 {job.ubicacion}</p>
                </div>
                <div style={styles.itemFooterRow}>
                  <span style={styles.itemSalary}>{job.sueldo || 'A tratar'}</span>
                  <div style={styles.itemButtons}>
                    {/* BOTÓN DE COMPARTIR CORREGIDO Y FUNCIONAL EN LÍNEA */}
                    <button 
                    onClick={() => {
                        // 1. Detecta automáticamente si estás probando local o en Vercel
                        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://chambafija.vercel.app';
                        const url = `${baseUrl}/oferta/${job._id}`;
                        
                        // 2. Arma el mensaje corporativo exacto para la difusión
                        const text = `🚨 *Nueva Oferta en ChambaFija*\n🏢 ${job.empresa}\n💼 ${job.titulo}\n💰 ${job.sueldo || 'A tratar'}\n📍 ${job.ubicacion}\n\n👉 Postula aquí: ${url}`;
                        
                        // 3. Método infalible para PC y Celular: Abre WhatsApp Web o la App directamente
                        const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
                        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
                    }} 
                    style={{...styles.btnEdit, backgroundColor: '#06D6A0', color: '#0B132B', borderColor: '#059669', fontWeight: '900'}}
                    >
                    Compartir 📲
                    </button>
                    <button onClick={() => handleEdit(job)} style={styles.btnEdit}>Editar</button>
                    <button onClick={() => handleDelete(job._id)} style={styles.btnDelete}>Eliminar</button>
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

// ESTOS ESTILOS SON OBLIGATORIOS PARA QUE EL PANEL SE VEA BIEN
const styles = {
  wrapper: { padding: '24px', backgroundColor: '#F1F5F9', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' },
  tabNav: { display: 'flex', gap: '12px', marginBottom: '24px', maxWidth: '1200px', margin: '0 auto 24px auto' },
  tabBtn: { flex: 1, padding: '14px', borderRadius: '12px', borderWidth: '1px', borderStyle: 'solid', fontWeight: '900', fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' },
  mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', maxWidth: '1200px', margin: '0 auto' },
  card: { backgroundColor: '#FFFFFF', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #CBD5E1' },
  cardHeader: { marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' },
  cardTitle: { fontSize: '16px', fontWeight: '900', color: '#0B132B', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  row: { display: 'flex', gap: '10px' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px', flex: 1 },
  label: { fontSize: '12px', fontWeight: '900', color: '#0B132B' },
  input: { padding: '10px 12px', borderRadius: '8px', border: '1px solid #94A3B8', fontSize: '14px', fontWeight: '600', color: '#0B132B', outline: 'none', backgroundColor: '#FFFFFF' },
  linkBlock: { backgroundColor: '#F8FAFC', padding: '12px', borderRadius: '10px', border: '1px solid #CBD5E1', display: 'flex', flexDirection: 'column', gap: '6px' },
  vipContainer: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #86EFAC' },
  vipLabel: { fontSize: '13px', fontWeight: '900', color: '#166534', cursor: 'pointer' },
  btnGroup: { display: 'flex', gap: '8px', marginTop: '6px' },
  btnPrimary: { flex: 1, padding: '12px', backgroundColor: '#0B132B', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  btnSecondary: { padding: '12px 18px', backgroundColor: '#64748B', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '900', fontSize: '13px', cursor: 'pointer' },
  listHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px' },
  counterBadge: { fontSize: '12px', backgroundColor: '#E2E8F0', color: '#0B132B', padding: '3px 10px', borderRadius: '12px', fontWeight: '900' },
  scrollList: { display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '700px', overflowY: 'auto', paddingRight: '4px' },
  itemCard: { padding: '14px', borderRadius: '12px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  tagModality: { fontSize: '10px', fontWeight: '900', backgroundColor: '#0B132B', color: '#FFFFFF', padding: '3px 8px', borderRadius: '6px' },
  itemTitle: { fontSize: '15px', fontWeight: '900', color: '#0B132B', margin: '6px 0 4px 0' },
  itemMeta: { fontSize: '13px', color: '#334155', margin: 0, fontWeight: '700' },
  itemFooterRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #F1F5F9' },
  itemSalary: { fontSize: '14px', fontWeight: '900', color: '#059669' },
  itemButtons: { display: 'flex', gap: '6px' },
  btnEdit: { padding: '6px 12px', fontSize: '12px', fontWeight: '900', backgroundColor: '#F1F5F9', color: '#0B132B', border: '1px solid #94A3B8', borderRadius: '6px', cursor: 'pointer' },
  btnDelete: { padding: '6px 12px', fontSize: '12px', fontWeight: '900', backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5', borderRadius: '6px', cursor: 'pointer' },
  btnAddRow: { background: 'none', border: 'none', color: '#059669', fontSize: '12px', fontWeight: '900', cursor: 'pointer', padding: '4px 0', textAlign: 'left' },
  btnDeleteRow: { background: 'none', border: 'none', color: '#EF4444', fontWeight: '900', fontSize: '16px', cursor: 'pointer', padding: '0 8px' }
};