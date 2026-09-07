"use client";
import React, { useState, useEffect } from 'react';

// Conexión hacia tu backend en la nube
const API_URL = '/api/jobs';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('estado');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    tipo: 'Estado',
    titulo: '',
    empresa: '',
    logo: '',
    ubicacion: '',
    sueldo: '',
    modalidad: 'CAS',
    modalidades: [],
    descripcion: '',
    vacantes: '1',
    formacion: '',
    experiencia: '',
    especializacion: '',
    lugarPrestacion: '',
    comoPostular: '',
    enlaceBases: '',
    enlacesExtras: [{ titulo: '', url: '' }],
    contacto: '',
    contactos: [''],
    fechaInicio: '',
    fechaVencimiento: '',
    horaVencimiento: '',
    esVip: false,
    area: '',
    categoriaClasificado: 'Locales en alquiler',
    tipoLocal: '', ambientes: '', banos: '', garantia: '',
    tipoVivienda: '', dormitorios: '', cochera: '', amoblado: '', serviciosIncluidos: '',
    tipoVehiculo: '', marca: '', modelo: '', anio: '', kilometraje: '', combustible: '',
    transmision: '', colorVehiculo: '', tipoServicio: '', modalidadServicio: '', zonaAtencion: '',
    producto: '', marcaProducto: '', estadoProducto: '', cantidad: ''
  });

  const [customLocation, setCustomLocation] = useState(false);
  const standardLocations = [
    'Chaupimarca, Pasco',
    'Yanacancha, Pasco',
    'Simón Bolívar, Pasco',
    'Pallanchacra, Pasco',
    'Yarusyacán, Pasco',
    'Oxapampa, Pasco',
    'Villa Rica, Pasco'
  ];

  const fetchJobs = async () => {
    setLoading(true);
    try {
      let tipoQuery = 'Estado';
      if (activeTab === 'privado') tipoQuery = 'Privado';
      if (activeTab === 'clasificados') tipoQuery = 'Clasificado';

      const res = await fetch(`/api/jobs?tipo=${tipoQuery}`);

      if (!res.ok) {
        throw new Error(`Error del servidor: ${res.status} ${res.statusText}`);
      }

      const result = await res.json();
      if (result.success) {
        setJobs(result.data || []);
      }
    } catch (error) {
      console.error("Error al cargar empleos:", error);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let nuevoTipo = 'Estado';
    if (activeTab === 'privado') nuevoTipo = 'Privado';
    if (activeTab === 'clasificados') nuevoTipo = 'Clasificado';
    setFormData(prev => ({ ...prev, tipo: nuevoTipo }));
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

      const modalidadFinal = activeTab === 'privado' 
        ? (formData.modalidades.length > 0 ? formData.modalidades.join(', ') : 'No especificado')
        : (formData.modalidad || 'No especificado');

      const datosAEnviar = { 
        ...formData, 
        sueldo: sueldoLimpio,
        modalidad: modalidadFinal,
        contacto: (activeTab === 'privado' || activeTab === 'clasificados') ? formData.contactos.filter(c => c.trim() !== '').join(', ') : formData.contacto
      };

      // Si es un anuncio nuevo, agregamos fecha de creación para mostrar "Publicado el..."
      if (!editingId) {
        datosAEnviar.fechaInicio = new Date().toISOString();
      }

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
    if (job.ubicacion && !standardLocations.includes(job.ubicacion)) {
      setCustomLocation(true);
    } else {
      setCustomLocation(false);
    }

    setFormData({
      tipo: job.tipo || 'Estado',
      titulo: job.titulo || '',
      empresa: job.empresa || '',
      logo: job.logo || '',
      ubicacion: job.ubicacion || 'Chaupimarca, Pasco',
      sueldo: job.sueldo || '',
      modalidad: job.modalidad || 'CAS',
      modalidades: job.modalidad && job.tipo === 'Privado' && job.modalidad !== 'No especificado' ? job.modalidad.split(', ').map(m => m.trim()) : [],
      descripcion: job.descripcion || '',
      vacantes: job.vacantes || '1',
      formacion: job.formacion || '',
      experiencia: job.experiencia || '',
      especializacion: job.especializacion || '',
      lugarPrestacion: job.lugarPrestacion || '',
      comoPostular: job.comoPostular || '',
      enlaceBases: job.enlaceBases || '',
      enlacesExtras: job.enlacesExtras && job.enlacesExtras.length > 0 ? job.enlacesExtras : [{ titulo: '', url: '' }],
      contacto: job.contacto || '',
      contactos: (job.contacto && (job.tipo === 'Privado' || job.tipo === 'Clasificado')) ? job.contacto.split(', ').map(c => c.trim()) : [job.contacto || ''],
      fechaVencimiento: job.fechaVencimiento ? job.fechaVencimiento.split('T')[0] : '',
      fechaInicio: job.fechaInicio ? job.fechaInicio.split('T')[0] : '',
      horaVencimiento: job.horaVencimiento || '',
      esVip: job.esVip || false,
      area: job.area || '',
      categoriaClasificado: job.categoriaClasificado || 'Locales en alquiler',
      tipoLocal: job.tipoLocal || '', ambientes: job.ambientes || '', banos: job.banos || '', garantia: job.garantia || '',
      tipoVivienda: job.tipoVivienda || '', dormitorios: job.dormitorios || '', cochera: job.cochera || '', amoblado: job.amoblado || '', serviciosIncluidos: job.serviciosIncluidos || '',
      tipoVehiculo: job.tipoVehiculo || '', marca: job.marca || '', modelo: job.modelo || '', anio: job.anio || '', kilometraje: job.kilometraje || '', combustible: job.combustible || '',
      transmision: job.transmision || '', colorVehiculo: job.colorVehiculo || '', tipoServicio: job.tipoServicio || '', modalidadServicio: job.modalidadServicio || '', zonaAtencion: job.zonaAtencion || '',
      producto: job.producto || '', marcaProducto: job.marcaProducto || '', estadoProducto: job.estadoProducto || '', cantidad: job.cantidad || ''
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
    setCustomLocation(false);
    setFormData({
      tipo: activeTab === 'estado' ? 'Estado' : activeTab === 'privado' ? 'Privado' : 'Clasificado',
      titulo: '',
      empresa: '',
      logo: '',
      ubicacion: 'Chaupimarca, Pasco',
      sueldo: '',
      modalidad: activeTab === 'estado' ? '' : '',
      modalidades: [],
      descripcion: '',
      vacantes: '1',
      formacion: '',
      experiencia: '',
      especializacion: '',
      lugarPrestacion: '',
      comoPostular: '',
      enlaceBases: '',
      enlacesExtras: [{ titulo: '', url: '' }],
      contacto: '',
      contactos: [''],
      fechaVencimiento: '',
      horaVencimiento: '',
      esVip: false,
      area: '',
      categoriaClasificado: 'Locales en alquiler',
      tipoLocal: '', ambientes: '', banos: '', garantia: '',
      tipoVivienda: '', dormitorios: '', cochera: '', amoblado: '', serviciosIncluidos: '',
      tipoVehiculo: '', marca: '', modelo: '', anio: '', kilometraje: '', combustible: '',
      transmision: '', colorVehiculo: '', tipoServicio: '', modalidadServicio: '', zonaAtencion: '',
      producto: '', marcaProducto: '', estadoProducto: '', cantidad: ''
    });
  };

  // Configuración dinámica de Clasificados: cada categoría tiene campos y color propios.
  const categoriasClasificados = {
    'Locales en alquiler': { icono: '🏪', color: '#2563EB', fondo: '#EFF6FF', borde: '#93C5FD', titulo: 'Información del Local', campos: ['tipoLocal','area','ambientes','banos','garantia','precio'] },
    'Viviendas en alquiler': { icono: '🏠', color: '#16A34A', fondo: '#F0FDF4', borde: '#86EFAC', titulo: 'Información de la Vivienda', campos: ['tipoVivienda','dormitorios','banos','area','cochera','amoblado','serviciosIncluidos','garantia','precio'] },
    'Vehículos': { icono: '🚗', color: '#DC2626', fondo: '#FEF2F2', borde: '#FCA5A5', titulo: 'Información del Vehículo', campos: ['tipoVehiculo','marca','modelo','anio','kilometraje','combustible','transmision','colorVehiculo','precio'] },
    'Servicios': { icono: '🛠️', color: '#9333EA', fondo: '#FAF5FF', borde: '#D8B4FE', titulo: 'Información del Servicio', campos: ['tipoServicio','modalidadServicio','zonaAtencion','precio'] },
    'Ventas': { icono: '🏷️', color: '#EA580C', fondo: '#FFF7ED', borde: '#FDBA74', titulo: 'Información del Producto', campos: ['producto','marcaProducto','estadoProducto','cantidad','precio'] },
    'Otros': { icono: '📌', color: '#64748B', fondo: '#F8FAFC', borde: '#CBD5E1', titulo: 'Información del Anuncio', campos: ['precio'] }
  };

  const categoriaActual = categoriasClasificados[formData.categoriaClasificado] || categoriasClasificados['Otros'];

  const renderCampoClasificado = (campo) => {
    const inputStyle = { ...styles.input, borderColor: categoriaActual.borde };
    const text = (name, label, placeholder, type = 'text') => (
      <div style={styles.field} key={name}><label style={styles.label}>{label}</label><input type={type} name={name} value={formData[name] || ''} onChange={handleChange} placeholder={placeholder} style={inputStyle} /></div>
    );
    const select = (name, label, options) => (
      <div style={styles.field} key={name}><label style={styles.label}>{label}</label><select name={name} value={formData[name] || ''} onChange={handleChange} style={inputStyle}><option value="">Seleccionar...</option>{options.map(o => <option key={o} value={o}>{o}</option>)}</select></div>
    );
    switch (campo) {
      case 'tipoLocal': return select('tipoLocal','🏪 Tipo de Local',['Local comercial','Tienda','Oficina','Restaurante','Almacén','Taller','Consultorio','Otro']);
      case 'area': return text('area','📐 Área / Medidas','Ej. 80 m²');
      case 'ambientes': return text('ambientes','🚪 Ambientes','Ej. 3','number');
      case 'banos': return text('banos','🚿 Baños','Ej. 2','number');
      case 'garantia': return text('garantia','🔐 Garantía','Ej. 1 mes / 2 meses');
      case 'tipoVivienda': return select('tipoVivienda','🏠 Tipo de Vivienda',['Casa','Departamento','Habitación','Mini departamento','Cuarto','Otro']);
      case 'dormitorios': return text('dormitorios','🛏️ Dormitorios','Ej. 3','number');
      case 'cochera': return select('cochera','🚘 Cochera',['Sí','No','Incluida','Opcional']);
      case 'amoblado': return select('amoblado','🛋️ Amoblado',['Amoblado','Semi amoblado','Sin amoblar']);
      case 'serviciosIncluidos': return text('serviciosIncluidos','💡 Servicios incluidos','Ej. Agua, luz, internet');
      case 'tipoVehiculo': return select('tipoVehiculo','🚗 Tipo de Vehículo',['Auto','SUV','Camioneta','Motocicleta','Minivan','Camión','Bus','Otro']);
      case 'marca': return text('marca','🏷️ Marca','Ej. Toyota');
      case 'modelo': return text('modelo','🚘 Modelo','Ej. Corolla');
      case 'anio': return text('anio','📅 Año','Ej. 2022','number');
      case 'kilometraje': return text('kilometraje','🛣️ Kilometraje','Ej. 45,000 km');
      case 'combustible': return select('combustible','⛽ Combustible',['Gasolina','Diésel','GLP','GNV','Eléctrico','Híbrido']);
      case 'transmision': return select('transmision','⚙️ Transmisión',['Manual','Automática','CVT','Otra']);
      case 'colorVehiculo': return text('colorVehiculo','🎨 Color','Ej. Blanco');
      case 'tipoServicio': return text('tipoServicio','🛠️ Tipo de Servicio','Ej. Diseño gráfico, reparación, fotografía...');
      case 'modalidadServicio': return select('modalidadServicio','📋 Modalidad',['Presencial','A domicilio','Virtual','Presencial y virtual']);
      case 'zonaAtencion': return text('zonaAtencion','📍 Zona de Atención','Ej. Cerro de Pasco y alrededores');
      case 'producto': return text('producto','📦 Producto','Ej. Laptop Lenovo');
      case 'marcaProducto': return text('marcaProducto','🏷️ Marca','Ej. Lenovo');
      case 'estadoProducto': return select('estadoProducto','✨ Estado',['Nuevo','Seminuevo','Usado','Reacondicionado']);
      case 'cantidad': return text('cantidad','🔢 Cantidad','Ej. 1','number');
      case 'precio': return text('sueldo','💰 Precio',formData.categoriaClasificado === 'Vehículos' ? 'Ej. 45,000' : 'Ej. 1,500 mensuales');
      default: return null;
    }
  };

  const renderLocationField = () => (
    <div style={styles.field}>
      <label style={styles.label}>Ubicación</label>
      {!customLocation ? (
        <div style={{ display: 'flex', gap: '6px' }}>
          <select 
            name="ubicacion" 
            value={formData.ubicacion} 
            onChange={handleChange} 
            style={{ ...styles.input, flex: '1 1 auto' }}
          >
            {standardLocations.map(loc => (
              <option key={loc} value={loc}>{loc}</option>
            ))}
          </select>
          <button 
            type="button" 
            onClick={() => { setCustomLocation(true); setFormData({ ...formData, ubicacion: '' }); }}
            style={styles.btnManual}
            title="Escribir libremente"
          >
            ✏️
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: '6px' }}>
          <input 
            type="text" 
            name="ubicacion" 
            value={formData.ubicacion} 
            onChange={handleChange} 
            placeholder="Escribe exacto..." 
            style={{ ...styles.input, flex: '1 1 auto' }}
            required 
          />
          <button 
            type="button" 
            onClick={() => { setCustomLocation(false); setFormData({ ...formData, ubicacion: 'Chaupimarca, Pasco' }); }}
            style={styles.btnManual}
            title="Volver a lista"
          >
            📋
          </button>
        </div>
      )}
    </div>
  );

  // Filtrar internamente considerando la Fecha y Hora Exacta
  const activeJobsList = jobs.filter(job => {
    if (!job.fechaVencimiento) return true;
    const [year, month, day] = job.fechaVencimiento.split('T')[0].split('-');
    
    // Por defecto es a las 11:59 PM (23:59:59) si no se especifica hora
    let h = 23, m = 59;
    if (job.horaVencimiento) {
      const [hours, minutes] = job.horaVencimiento.split(':');
      h = parseInt(hours, 10);
      m = parseInt(minutes, 10);
    }
    
    const fechaExp = new Date(Number(year), Number(month) - 1, Number(day), h, m, 59);
    return new Date() <= fechaExp;
  });

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
          🏛️ Estado
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
          💼 Empleos Locales
        </button>
        <button onClick={() => setActiveTab('clasificados')} style={{...styles.tabBtn, backgroundColor: activeTab === 'clasificados' ? '#4F46E5' : '#FFFFFF', color: activeTab === 'clasificados' ? '#FFFFFF' : '#0B132B', borderColor: activeTab === 'clasificados' ? '#4F46E5' : '#CBD5E1'}}>
          📢 Clasificados
        </button>
      </div>

      <div style={styles.mainGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              {editingId ? '✏️ Modificar Registro' : (activeTab === 'estado' ? '🏛️ Nueva Convocatoria' : activeTab === 'privado' ? '💼 Nuevo Empleo Local' : '📢 Nuevo Anuncio Clasificado')}            </h2>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* ================= ESTADO ================= */}
            {activeTab === 'estado' ? (
              <>
                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Entidad Pública</label>
                    <input type="text" name="empresa" value={formData.empresa} onChange={handleChange} placeholder="Ej. GORE Pasco" style={styles.input} required />
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
                
                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Logo (URL Imagen)</label>
                    <input type="url" name="logo" value={formData.logo} onChange={handleChange} placeholder="https://.../logo.png" style={styles.input} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Título del Puesto</label>
                    <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Ej. Asistente Administrativo I" style={styles.input} required />
                  </div>
                  {renderLocationField()}
                </div>

                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Vacantes</label>
                    <input type="number" name="vacantes" value={formData.vacantes} onChange={handleChange} style={styles.input} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Remuneración (S/)</label>
                    <input type="text" name="sueldo" value={formData.sueldo} onChange={handleChange} placeholder="Ej. 2500" style={styles.input} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>📅 Fecha Inicio Postulación</label>
                    <input type="date" name="fechaInicio" value={formData.fechaInicio} onChange={handleChange} style={styles.input} />
                  </div>
                  <div style={styles.field}>
                    <div style={styles.field}>
                      <label style={styles.label}>📅 Fecha Cierre (Límite)</label>
                      <input type="date" name="fechaVencimiento" value={formData.fechaVencimiento} onChange={handleChange} style={styles.input} />
                    </div>
                    <label style={styles.label}>Hora Límite</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input type="time" name="horaVencimiento" value={formData.horaVencimiento} onChange={handleChange} style={{ ...styles.input, flex: '1 1 auto' }} />
                    </div>
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Formación Académica</label>
                  <textarea name="formacion" value={formData.formacion} onChange={handleChange} placeholder="Ej. TÍTULO EN DERECHO..." style={styles.textarea} />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Experiencia Requerida</label>
                  <textarea name="experiencia" value={formData.experiencia} onChange={handleChange} placeholder="Ej. Experiencia de 2 años..." style={styles.textarea} />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Cursos / Especialización</label>
                  <textarea name="especializacion" value={formData.especializacion} onChange={handleChange} placeholder="Ej. Diplomado, ofimática..." style={styles.textarea} />
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>¿Cómo postular?</label>
                  <textarea name="comoPostular" value={formData.comoPostular} onChange={handleChange} placeholder="Instrucciones..." style={styles.textarea} />
                </div>

                <div style={{ ...styles.field, backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <label style={{ ...styles.label, marginBottom: '6px', color: '#0B132B' }}>🔗 Enlaces Oficiales (Bases, PDF)</label>
                  <div style={{ marginBottom: '6px' }}>
                    <input type="url" name="enlaceBases" value={formData.enlaceBases} onChange={handleChange} placeholder="Enlace principal (Bases)" style={{ ...styles.input, marginBottom: '6px' }} />
                  </div>

                  {formData.enlacesExtras.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <input 
                        type="text" 
                        placeholder="Ej. Comunicado" 
                        value={item.titulo} 
                        onChange={(e) => handleExtraLinkChange(index, 'titulo', e.target.value)} 
                        style={{ ...styles.input, flex: '1 1 100px' }} 
                      />
                      <input 
                        type="url" 
                        placeholder="https://..." 
                        value={item.url} 
                        onChange={(e) => handleExtraLinkChange(index, 'url', e.target.value)} 
                        style={{ ...styles.input, flex: '1 1 140px' }} 
                      />
                      <button type="button" onClick={() => eliminarFilaEnlace(index)} style={{ ...styles.btnDeleteRow, flex: '1 1 auto' }}>✕ Quitar</button>
                    </div>
                  ))}
                  <button type="button" onClick={agregarFilaEnlace} style={styles.btnAddRow}>+ Agregar otro enlace</button>
                </div>
              </>
            ) : activeTab === 'privado' ? (
              <>
                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Nombre del Negocio</label>
                    <input type="text" name="empresa" value={formData.empresa} onChange={handleChange} placeholder="Ej. Pollería Kimbos" style={styles.input} required />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Vacantes</label>
                    <input type="number" name="vacantes" value={formData.vacantes} onChange={handleChange} placeholder="1" style={styles.input} />
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Logo (URL Imagen)</label>
                    <input type="url" name="logo" value={formData.logo} onChange={handleChange} placeholder="https://.../logo.png" style={styles.input} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Puesto Requerido</label>
                    <input type="text" name="titulo" value={formData.titulo} onChange={handleChange} placeholder="Ej. Mozo / Ayudante" style={styles.input} required />
                  </div>
                  {renderLocationField()}
                </div>
                  
                <div style={{ ...styles.field, backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
                  <label style={styles.label}>Modalidad de Trabajo</label>
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                    {['Tiempo Completo', 'Medio Tiempo', 'CAS', 'Por Horas', 'Fines de Semana', 'Prácticas'].map(mod => (
                      <label key={mod} style={{ fontSize: '11px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', color: '#0B132B' }}>
                        <input
                          type="checkbox"
                          checked={formData.modalidades.includes(mod)}
                          onChange={(e) => {
                            if (e.target.checked) setFormData({ ...formData, modalidades: [...formData.modalidades, mod] });
                            else setFormData({ ...formData, modalidades: formData.modalidades.filter(m => m !== mod) });
                          }}
                          style={{ accentColor: '#06D6A0', width: '14px', height: '14px' }}
                        /> {mod}
                      </label>
                    ))}
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Sueldo (S/)</label>
                    <input type="text" name="sueldo" value={formData.sueldo} onChange={handleChange} placeholder="Ej. 1200 o A tratar" style={styles.input} />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Fecha de Cierre</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input type="date" name="fechaVencimiento" value={formData.fechaVencimiento} onChange={handleChange} style={{ ...styles.input, flex: '1 1 auto' }} />
                    </div>
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Hora de Cierre</label>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <input type="time" name="horaVencimiento" value={formData.horaVencimiento} onChange={handleChange} style={{ ...styles.input, flex: '1 1 auto' }} />
                    </div>
                  </div>
                </div>

                <div style={{ ...styles.field, backgroundColor: '#F0FDF4', padding: '10px', borderRadius: '8px', border: '1px solid #86EFAC' }}>
                  <label style={{ ...styles.label, color: '#166534', marginBottom: '6px' }}>📱 WhatsApp Contacto</label>
                  {formData.contactos.map((numero, index) => (
                    <div key={index} style={{ display: 'flex', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <input 
                        type="text" 
                        placeholder={`Ej. 987654321 (#${index + 1})`} 
                        value={numero} 
                        onChange={(e) => {
                          const nuevos = [...formData.contactos];
                          nuevos[index] = e.target.value;
                          setFormData({ ...formData, contactos: nuevos });
                        }} 
                        style={{ ...styles.input, flex: '1 1 120px', backgroundColor: '#FFFFFF' }} 
                        required={index === 0} 
                      />
                      {formData.contactos.length > 1 && (
                        <button type="button" onClick={() => setFormData({ ...formData, contactos: formData.contactos.filter((_, i) => i !== index) })} style={{ ...styles.btnDeleteRow, flex: '1 1 auto' }}>✕ Quitar</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setFormData({ ...formData, contactos: [...formData.contactos, ''] })} style={styles.btnAddRow}>+ Agregar otro número</button>
                </div>
              </>
            ) : (
              /* ================= CLASIFICADOS ================= */
              <>
                <div style={{ backgroundColor: categoriaActual.fondo, border: `1px solid ${categoriaActual.borde}`, borderLeft: `5px solid ${categoriaActual.color}`, borderRadius: '10px', padding: '12px', marginBottom: '2px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '22px' }}>{categoriaActual.icono}</span>
                    <div><div style={{ fontSize: '11px', fontWeight: '900', color: categoriaActual.color }}>CATEGORÍA DEL ANUNCIO</div><div style={{ fontSize: '16px', fontWeight: '900', color: '#0B132B' }}>{formData.categoriaClasificado}</div></div>
                  </div>
                  <div style={styles.row}>
                    <div style={styles.field}><label style={styles.label}>Título del Anuncio</label><input type="text" name="titulo" value={formData.titulo} onChange={handleChange} placeholder={formData.categoriaClasificado === 'Vehículos' ? 'Ej. Toyota Corolla 2022' : formData.categoriaClasificado === 'Viviendas en alquiler' ? 'Ej. Departamento en alquiler de 3 dormitorios' : formData.categoriaClasificado === 'Servicios' ? 'Ej. Servicio de fotografía y video' : formData.categoriaClasificado === 'Ventas' ? 'Ej. Laptop Lenovo en venta' : 'Ej. Alquiler de local comercial'} style={{ ...styles.input, borderColor: categoriaActual.borde }} required /></div>
                    <div style={styles.field}><label style={styles.label}>Categoría</label><select name="categoriaClasificado" value={formData.categoriaClasificado} onChange={handleChange} style={{ ...styles.input, borderColor: categoriaActual.color, fontWeight: '800' }}><option value="Locales en alquiler">🏪 Locales en alquiler</option><option value="Viviendas en alquiler">🏠 Viviendas en alquiler</option><option value="Vehículos">🚗 Vehículos</option><option value="Servicios">🛠️ Servicios</option><option value="Ventas">🏷️ Ventas</option><option value="Otros">📌 Otros</option></select></div>
                  </div>
                  <div style={{ marginTop: '10px', padding: '10px', backgroundColor: '#FFFFFF', borderRadius: '8px', border: `1px solid ${categoriaActual.borde}` }}>
                    <div style={{ color: categoriaActual.color, fontSize: '12px', fontWeight: '900', marginBottom: '9px' }}>{categoriaActual.icono} {categoriaActual.titulo}</div>
                    <div style={styles.row}>{categoriaActual.campos.map(renderCampoClasificado)}{renderLocationField()}</div>
                  </div>
                </div>
                <div style={styles.row}><div style={styles.field}><label style={styles.label}>Fecha de Vencimiento (Autoborrado)</label><input type="date" name="fechaVencimiento" value={formData.fechaVencimiento} onChange={handleChange} style={{ ...styles.input, borderColor: categoriaActual.borde }} /></div></div>
                <div style={{ ...styles.field, backgroundColor: '#FEFCE8', padding: '10px', borderRadius: '8px', border: '1px solid #FEF08A' }}>
                  <label style={{ ...styles.label, color: '#854D0E', marginBottom: '6px' }}>📱 WhatsApp del Anunciante</label>
                  {formData.contactos.map((numero, index) => (<div key={index} style={{ display: 'flex', gap: '4px', marginBottom: '6px', flexWrap: 'wrap' }}><input type="text" placeholder={`Ej. 987654321 (#${index + 1})`} value={numero} onChange={(e) => { const nuevos = [...formData.contactos]; nuevos[index] = e.target.value; setFormData({ ...formData, contactos: nuevos }); }} style={{ ...styles.input, flex: '1 1 120px', backgroundColor: '#FFFFFF' }} required={index === 0} />{formData.contactos.length > 1 && (<button type="button" onClick={() => setFormData({ ...formData, contactos: formData.contactos.filter((_, i) => i !== index) })} style={{ ...styles.btnDeleteRow, flex: '1 1 auto' }}>✕ Quitar</button>)}</div>))}
                  <button type="button" onClick={() => setFormData({ ...formData, contactos: [...formData.contactos, ''] })} style={styles.btnAddRow}>+ Agregar otro número</button>
                </div>
              </>
            )}

            <div style={styles.field}>
              <label style={styles.label}>Descripción / Notas</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} style={styles.textarea} required />
            </div>

            <div style={styles.vipContainer}>
              <input type="checkbox" id="esVip" name="esVip" checked={formData.esVip} onChange={handleChange} style={{ accentColor: '#166534' }} />
              <label htmlFor="esVip" style={styles.vipLabel}>⭐ Destacar Anuncio (VIP)</label>
            </div>

            <div style={styles.btnGroup}>
              <button type="submit" style={activeTab === 'clasificados' ? { ...styles.btnPrimary, backgroundColor: categoriaActual.color } : styles.btnPrimary}>
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
            <span style={styles.counterBadge}>{activeJobsList.length} ofertas</span>
          </div>

          <div style={styles.scrollList}>
            {activeJobsList.map((job) => (
              <div key={job._id} style={styles.itemCard}>
                <div>
                  <span style={{...styles.tagModality, backgroundColor: job.tipo === 'Clasificado' ? (categoriasClasificados[job.categoriaClasificado]?.color || '#4F46E5') : '#0B132B'}}>{job.tipo === 'Clasificado' ? `${categoriasClasificados[job.categoriaClasificado]?.icono || '📌'} ${job.categoriaClasificado}` : job.tipo}</span>
                  <h3 style={styles.itemTitle}>{job.titulo}</h3>
                  <p style={styles.itemMeta}><strong>{job.tipo === 'Clasificado' ? 'Clasificado' : job.empresa}</strong> • 📍 {job.ubicacion}</p>
                </div>
                <div style={styles.itemFooterRow}>
                  <span style={styles.itemSalary}>{job.sueldo || 'A tratar'}</span>
                  <div style={styles.itemButtons}>
                    <button 
                      onClick={() => {
                        const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://chambafija.vercel.app';
                        const url = `${baseUrl}/oferta/${job._id}`;
                        const text = `🚨 *Nueva Oferta*\n🏢 ${job.empresa}\n💼 ${job.titulo}\n📍 ${job.ubicacion}\n\n👉 Postula aquí: ${url}`;
                        window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                      }} 
                      style={{...styles.btnEdit, backgroundColor: '#06D6A0', color: '#0B132B', borderColor: '#059669', fontWeight: '900'}}
                    >
                      📲 Compartir
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

const styles = {
  wrapper: { padding: 'clamp(8px, 3vw, 24px)', backgroundColor: '#F1F5F9', minHeight: '100vh', fontFamily: 'system-ui, sans-serif' },
  tabNav: { display: 'flex', gap: '8px', marginBottom: '16px', maxWidth: '1200px', margin: '0 auto 16px auto', flexWrap: 'wrap' },
  tabBtn: { flex: '1 1 45%', padding: '12px', borderRadius: '10px', borderWidth: '1px', borderStyle: 'solid', fontWeight: '900', fontSize: 'clamp(12px, 4vw, 14px)', cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' },
  mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '16px', maxWidth: '1200px', margin: '0 auto' },
  card: { backgroundColor: '#FFFFFF', padding: 'clamp(14px, 4vw, 24px)', borderRadius: '14px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)', border: '1px solid #CBD5E1' },
  cardHeader: { marginBottom: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' },
  cardTitle: { fontSize: 'clamp(14px, 4vw, 16px)', fontWeight: '900', color: '#0B132B', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '12px' },
  row: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 130px', minWidth: 0 },
  label: { fontSize: '11px', fontWeight: '900', color: '#0B132B' },
  input: { padding: '9px 12px', borderRadius: '8px', border: '1px solid #94A3B8', fontSize: '13px', fontWeight: '600', color: '#0B132B', outline: 'none', backgroundColor: '#FFFFFF', width: '100%', boxSizing: 'border-box' },
  textarea: { padding: '9px 12px', borderRadius: '8px', border: '1px solid #94A3B8', fontSize: '13px', fontWeight: '600', color: '#0B132B', outline: 'none', backgroundColor: '#FFFFFF', width: '100%', boxSizing: 'border-box', minHeight: '80px', resize: 'vertical' },
  btnManual: { padding: '8px 10px', backgroundColor: '#E2E8F0', border: '1px solid #94A3B8', borderRadius: '8px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer', color: '#0B132B', flex: '0 0 auto', textAlign: 'center' },
  vipContainer: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', backgroundColor: '#F0FDF4', borderRadius: '8px', border: '1px solid #86EFAC', flexWrap: 'wrap' },
  vipLabel: { fontSize: '12px', fontWeight: '900', color: '#166534', cursor: 'pointer', flex: '1 1 auto' },
  btnGroup: { display: 'flex', gap: '8px', marginTop: '6px', flexWrap: 'wrap' },
  btnPrimary: { flex: '1 1 100%', padding: '12px', backgroundColor: '#0B132B', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '900', fontSize: '14px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' },
  btnSecondary: { flex: '1 1 100%', padding: '12px', backgroundColor: '#64748B', color: '#FFFFFF', border: 'none', borderRadius: '8px', fontWeight: '900', fontSize: '13px', cursor: 'pointer' },
  listHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid #E2E8F0', paddingBottom: '8px', flexWrap: 'wrap', gap: '8px' },
  counterBadge: { fontSize: '11px', backgroundColor: '#E2E8F0', color: '#0B132B', padding: '3px 10px', borderRadius: '12px', fontWeight: '900' },
  scrollList: { display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '2px' },
  itemCard: { padding: '14px', borderRadius: '10px', backgroundColor: '#FFFFFF', border: '1px solid #CBD5E1', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  tagModality: { fontSize: '9px', fontWeight: '900', backgroundColor: '#0B132B', color: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginBottom: '4px' },
  itemTitle: { fontSize: '14px', fontWeight: '900', color: '#0B132B', margin: '0 0 4px 0', lineHeight: '1.2' },
  itemMeta: { fontSize: '11px', color: '#334155', margin: 0, fontWeight: '700' },
  itemFooterRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '8px' },
  itemSalary: { fontSize: '13px', fontWeight: '900', color: '#059669' },
  itemButtons: { display: 'flex', gap: '6px', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' },
  btnEdit: { padding: '6px 12px', fontSize: '11px', fontWeight: '900', backgroundColor: '#F1F5F9', color: '#0B132B', border: '1px solid #94A3B8', borderRadius: '6px', cursor: 'pointer', flex: '1 1 auto', textAlign: 'center' },
  btnDelete: { padding: '6px 12px', fontSize: '11px', fontWeight: '900', backgroundColor: '#FEF2F2', color: '#991B1B', border: '1px solid #FCA5A5', borderRadius: '6px', cursor: 'pointer', flex: '1 1 auto', textAlign: 'center' },
  btnAddRow: { background: 'none', border: 'none', color: '#059669', fontSize: '11px', fontWeight: '900', cursor: 'pointer', padding: '4px 0', textAlign: 'left', width: '100%' },
  btnDeleteRow: { background: 'none', border: 'none', color: '#EF4444', fontWeight: '900', fontSize: '13px', cursor: 'pointer', padding: '4px 8px', textAlign: 'center' }
};