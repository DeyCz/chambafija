"use client";
import React, { useState, useEffect } from 'react';

// Conexión hacia tu backend en la nube
const API_URL = '/api/jobs';

// 1. DICCIONARIO DE LOGOS
const logosInstitucionales = {
  "INDECI": "https://yt3.ggpht.com/a/AGF-l7_I-6ge2y8wEBW0cGDJ5kLqdQU_If3LjFpb4A=s900-c-k-c0xffffffff-no-rj-mo",
  "PODER JUDICIAL": "https://seeklogo.com/images/P/poder-judicial-peru-logo-4159895347-seeklogo.com.png",
  "UNDAC": "https://th.bing.com/th/id/R.5d657ee7f84117237ea209992ae27772?rik=yqZ2%2bO5kaVD4uw&riu=http%3a%2f%2frepositorio.undac.edu.pe%2fimage%2flogo-UNDAC.png&ehk=V%2fyUwfTDF%2fsFxuuC1KZ5ECdtQMwXilQWvqTOrv4Y9%2b4%3d&risl=&pid=ImgRaw&r=0",
  "UNIVERSIDAD NACIONAL DANIEL ALCIDES CARRION": "https://th.bing.com/th/id/R.5d657ee7f84117237ea209992ae27772?rik=yqZ2%2bO5kaVD4uw&riu=http%3a%2f%2frepositorio.undac.edu.pe%2fimage%2flogo-UNDAC.png&ehk=V%2fyUwfTDF%2fsFxuuC1KZ5ECdtQMwXilQWvqTOrv4Y9%2b4%3d&risl=&pid=ImgRaw&r=0",
  "HRDAC": "https://hrdac-cerrodepasco.gob.pe/HDAC/images/logo/logo.png",
  "ONPE": "https://play-lh.googleusercontent.com/DJujnYahKciI3SHL4tPPGCJhTxLRG79SndabNaDTnXKL8XUch5ku_vZA15CAGLwa",
  "UGEL PUERTO BERMUDEZ": "https://tse3.mm.bing.net/th/id/OIP.pBiPwPPysHBVlWNmm26lHAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  "GOBIERNO REGIONAL PASCO": "https://tse4.mm.bing.net/th/id/OIP.Js3L5-3s8HEGbG14VYaUagHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  "INEI": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEjKyZTQz7Yq_XjhClSkhfoGJHiQ-JFpbeDZwYpdlTj3um6keFKyhFRx2hiS_v7MndjltV0YIMTAGsdztZauDR5eVHREsQswGA3O3eGxn23QoS-1W_gyPeNyt8WFMobDI1oS8epCfnoSCoEbeYtZGkDzT8CapjbLcx5fIib49RIgyA28_ihrcw7Fn5YQSoeX/s16000-rw/INEI%20logo%202025.webp",
  "SIS": "https://tse3.mm.bing.net/th/id/OIP.F3j4x2tMr76d9XgMxxKAwgHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  "CONTRALORIA": "https://th.bing.com/th/id/R.291734d40a33200cbe2a331024a292a0?rik=KXsfPN1s9xvHgQ&riu=http%3a%2f%2fwww.iddss.org.pe%2fwp-content%2fuploads%2f2019%2f04%2fctre.jpg&ehk=IY98sXDjyGK4TMtfgpLKmbnwlu%2bkP5Y1UpgL2ZkeLJw%3d&risl=&pid=ImgRaw&r=0",
  "PENSION 65":"https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhO3-8ffiRFO3IpZWFYl3cWQ0w2Zm2a794tAAXxh8uWs47V8svXwR42fAhi6Yp2ersffV-sC6W75tGa3ETmbpvJtTlDswimR2sahd7TRXbxpuhbyEaSjtkPEQHpNIf3AtR4x3ZgmB_P7QnB/s320/logo-pension65.png",
  "MUNICIPALIDAD DISTRITAL DE VICCO": "https://www.convocatoriascas.com/imagenes/organizaciones/imagen-MUNICIPALIDAD-DISTRITAL-DE-VICCO.jpg",
  "SUNAFIL": "https://tse2.mm.bing.net/th/id/OIP.dr2NB_51qHg3IMbtiph2mgAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  "PAE": "https://www.convocatoriasdetrabajo.com/imagenes/organizaciones/th-imagen-PROGRAMA-DE-ALIMENTACION-ESCOLAR-PAE.jpg",
  "CUNA MAS": "https://oportunidadeslaborales.uladech.edu.pe/wp-content/uploads/2022/05/CUNA-MAS.jpg",
  "ITP": "https://2.bp.blogspot.com/-l10PiVP1WSk/VfGxvAng6OI/AAAAAAAAAPs/LyRyW2slR3w/s1600/095%2BITP.jpg",
  "DEFENSORIA DEL PUEBLO": "https://tse3.mm.bing.net/th/id/OIP.zfID3eCJ1XBZg6yfoxNerwAAAA?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  "DRE PASCO": "https://1.bp.blogspot.com/-rTomKEx3i38/X5oB6fzreaI/AAAAAAABlls/UTP-A3_lCkkBaKVxlB9W5DD89dauEiRoACLcBGAsYHQ/s1080/dre-pasco-logo.jpg",
  "DIRESA PASCO": "https://tse1.mm.bing.net/th/id/OIP.0AIIYZMFLGramynavdj9VAHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  "FONCODES": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEg9joxXl4OXlX1j3oxAYN30JT3aYMXqqm_HWGOYH7DJDZXnIhyphenhyphen5w1NlSOCa9f0tvkyOY7E9r1bw7lDePTZc7o2M1vbvUOvSPgxgKjbHZQQYagh6ZB8b8HxCu5pNcsscj-oDgdDvznao-bY/s1600/045+FONCODES.jpg",
  "PALCAZU": "https://tse4.mm.bing.net/th/id/OIP.icg2crlw0PCguydXp5np5gHaHd?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
  "MUNICIPALIDAD DE HUACHON": "https://tse4.mm.bing.net/th/id/OIP.ius3TEpxkUSrtMi7ViewngHaHa?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
};

function normalizarNombreLogo(nombre) {
  if (!nombre) return "";
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .trim();
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('estado');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const [scrapeUrl, setScrapeUrl] = useState('');
  const [scrapeLoading, setScrapeLoading] = useState(false);
  const [scrapeResult, setScrapeResult] = useState(null);
  const [scrapeError, setScrapeError] = useState('');

  const [mostrarVencidos, setMostrarVencidos] = useState(false);

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
    comoPostular: '',
    enlaceBases: '',
    enlacesExtras: [{ titulo: '', url: '' }],
    contacto: '',
    contactos: [''],
    fechaInicio: '',
    fechaVencimiento: '',
    horaVencimiento: '',
    fechaPublicacion: '',
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

  const ordenarPorFechaCreacion = (registros) => {
    return [...registros].sort((a, b) => {
      const obtenerFecha = (job) => {
        if (job.createdAt) {
          const fecha = new Date(job.createdAt).getTime();
          if (!isNaN(fecha)) return fecha;
        }
        if (job._id && /^[a-fA-F0-9]{24}$/.test(job._id)) {
          return parseInt(job._id.substring(0, 8), 16) * 1000;
        }
        return 0;
      };
      return obtenerFecha(a) - obtenerFecha(b);
    });
  };

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
        const registrosOrdenados = ordenarPorFechaCreacion(result.data || []);
        setJobs(registrosOrdenados);
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
    setMostrarVencidos(false);
  }, [activeTab]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      };

      if (name === 'empresa') {
        const nombreNormalizado = normalizarNombreLogo(value);
        const logoEncontrado = Object.keys(logosInstitucionales).find(key =>
          nombreNormalizado.includes(key)
        );

        if (logoEncontrado) {
          newData.logo = logosInstitucionales[logoEncontrado];
        }
      }

      return newData;
    });
  };

  const importarConvocatoria = async () => {
    setScrapeError('');
    setScrapeResult(null);
    if (!scrapeUrl.trim()) {
      setScrapeError('Pega primero el enlace de la convocatoria.');
      return;
    }
    setScrapeLoading(true);
    try {
      const response = await fetch('/api/admin/scrape-convocatoria', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: scrapeUrl.trim() })
      });
      let result = null;
      try {
        result = await response.json();
      } catch {
        throw new Error(
          `El servidor respondió ${response.status}, pero no envió JSON. Verifica que la API esté desplegada en producción.`
        );
      }

      if (!response.ok || !result?.success) {
        throw new Error(result?.mensaje || `No se pudo importar la convocatoria (HTTP ${response.status}).`);
      }

      setScrapeResult(result);
    } catch (error) {
      setScrapeError(error.message || 'Ocurrió un error al importar.');
    } finally {
      setScrapeLoading(false);
    }
  };

  const pasarImportacionAlFormulario = () => {
    if (!scrapeResult?.data) return;
    const d = scrapeResult.data;
    const modalidadRaw = String(d.modalidad || '').toLowerCase();
    let modalidad = '';
    if (modalidadRaw.includes('728')) modalidad = '728';
    else if (modalidadRaw.includes('276')) modalidad = '276';
    else if (modalidadRaw.includes('práct') || modalidadRaw.includes('pract')) modalidad = 'Prácticas';
    else if (modalidadRaw.includes('locación') || modalidadRaw.includes('locacion')) modalidad = 'Locación';
    else if (modalidadRaw.includes('cas')) modalidad = 'CAS';

    setActiveTab('estado');
    setEditingId(null);
    setCustomLocation(true);

    const empresaDetectada = d.empresa || '';
    let logoAsignado = '';
    const nombreNormalizado = normalizarNombreLogo(empresaDetectada);
    const logoEncontrado = Object.keys(logosInstitucionales).find(key =>
      nombreNormalizado.includes(key)
    );
    if (logoEncontrado) {
      logoAsignado = logosInstitucionales[logoEncontrado];
    }

    setFormData(prev => ({
      ...prev,
      tipo: 'Estado',
      empresa: empresaDetectada,
      logo: logoAsignado,
      modalidad: modalidad || 'CAS',
      titulo: d.titulo || '',
      ubicacion: '',
      vacantes: d.vacantes || '1',
      sueldo: d.sueldo || '',
      fechaInicio: d.fechaInicio || '',
      fechaVencimiento: d.fechaVencimiento || '',
      horaVencimiento: d.horaVencimiento || '',
      formacion: d.formacion || '',
      experiencia: d.experiencia || '',
      especializacion: d.especializacion || '',
      comoPostular: d.comoPostular || '',
      enlaceBases: d.enlaceBases || '',
      enlacesExtras: (d.enlacesExtras && d.enlacesExtras.length > 0 && d.enlacesExtras[0].url !== "")
        ? d.enlacesExtras
        : [{ titulo: '', url: '' }],
      descripcion: d.descripcion || ''
    }));
    setScrapeUrl('');      // Limpia el input del enlace para pegar el siguiente
    setScrapeResult(null); // Opcional: cierra también el cuadro de vista previa ya copiado
    setScrapeError('');
    window.setTimeout(() => {
      document.getElementById('formulario-convocatoria')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
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
        contacto: (activeTab === 'privado' || activeTab === 'clasificados')
          ? formData.contactos.filter(c => c.trim() !== '').join(', ')
          : formData.contacto
      };

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
        if (editingId) setMostrarVencidos(false);
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
      comoPostular: job.comoPostular || '',
      enlaceBases: job.enlaceBases || '',
      enlacesExtras: job.enlacesExtras && job.enlacesExtras.length > 0 ? job.enlacesExtras : [{ titulo: '', url: '' }],
      contacto: job.contacto || '',
      contactos: (job.contacto && (job.tipo === 'Privado' || job.tipo === 'Clasificado')) ? job.contacto.split(', ').map(c => c.trim()) : [job.contacto || ''],
      fechaVencimiento: job.fechaVencimiento ? job.fechaVencimiento.split('T')[0] : '',
      fechaInicio: job.fechaInicio ? job.fechaInicio.split('T')[0] : '',
      fechaPublicacion: job.fechaPublicacion || '',
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
    if (!window.confirm('¿Estás seguro de eliminar este registro de forma definitiva?')) return;
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
      modalidad: activeTab === 'estado' ? '' : 'CAS',
      modalidades: [],
      descripcion: '',
      vacantes: '1',
      formacion: '',
      experiencia: '',
      especializacion: '',
      comoPostular: '',
      enlaceBases: '',
      enlacesExtras: [{ titulo: '', url: '' }],
      contacto: '',
      contactos: [''],
      fechaInicio: '',
      fechaVencimiento: '',
      fechaPublicacion: '',
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

  const categoriasClasificados = {
    'Locales en alquiler': { icono: '🏪', color: '#2563EB', fondo: '#EFF6FF', borde: '#BFDBFE', titulo: 'Información del Local', campos: ['tipoLocal','area','ambientes','banos','garantia','precio'] },
    'Viviendas en alquiler': { icono: '🏠', color: '#059669', fondo: '#ECFDF5', borde: '#A7F3D0', titulo: 'Información de la Vivienda', campos: ['tipoVivienda','dormitorios','banos','area','cochera','amoblado','serviciosIncluidos','garantia','precio'] },
    'Vehículos': { icono: '🚗', color: '#DC2626', fondo: '#FEF2F2', borde: '#FECACA', titulo: 'Información del Vehículo', campos: ['tipoVehiculo','marca','modelo','anio','kilometraje','combustible','transmision','colorVehiculo','precio'] },
    'Servicios': { icono: '🛠️', color: '#7C3AED', fondo: '#F5F3FF', borde: '#DDD6FE', titulo: 'Información del Servicio', campos: ['tipoServicio','modalidadServicio','zonaAtencion','precio'] },
    'Ventas': { icono: '🏷️', color: '#D97706', fondo: '#FFFBEB', borde: '#FDE68A', titulo: 'Información del Producto', campos: ['producto','marcaProducto','estadoProducto','cantidad','precio'] },
    'Otros': { icono: '📌', color: '#475569', fondo: '#F8FAFC', borde: '#CBD5E1', titulo: 'Información del Anuncio', campos: ['precio'] }
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

  const processedJobs = jobs.map(job => {
    let isExpired = false;
    if (job.fechaVencimiento) {
      const [year, month, day] = job.fechaVencimiento.split('T')[0].split('-');
      let h = 23, m = 59;
      if (job.horaVencimiento) {
        const [hours, minutes] = job.horaVencimiento.split(':');
        h = parseInt(hours, 10);
        m = parseInt(minutes, 10);
      }
      const fechaExp = new Date(Number(year), Number(month) - 1, Number(day), h, m, 59);
      isExpired = new Date() > fechaExp;
    }
    return { ...job, isExpired };
  });

  const displayJobsList = processedJobs
    .filter(job => mostrarVencidos ? job.isExpired : !job.isExpired)
    .reverse();

  return (
    <div style={styles.wrapper}>
      <div style={styles.tabNav}>
        <button
          onClick={() => setActiveTab('estado')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'estado' ? '#0B132B' : '#FFFFFF',
            color: activeTab === 'estado' ? '#FFFFFF' : '#0B132B',
            borderColor: activeTab === 'estado' ? '#0B132B' : '#E2E8F0',
            boxShadow: activeTab === 'estado' ? '0 8px 20px -6px rgba(11,19,43,0.35)' : '0 1px 3px rgba(11,19,43,0.04)',
          }}
        >
          🏛️ Estado
        </button>
        <button
          onClick={() => setActiveTab('privado')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'privado' ? '#06D6A0' : '#FFFFFF',
            color: '#0B132B',
            borderColor: activeTab === 'privado' ? '#06D6A0' : '#E2E8F0',
            boxShadow: activeTab === 'privado' ? '0 8px 20px -6px rgba(6,214,160,0.4)' : '0 1px 3px rgba(11,19,43,0.04)',
          }}
        >
          💼 Empleos Locales
        </button>
        <button
          onClick={() => setActiveTab('clasificados')}
          style={{
            ...styles.tabBtn,
            backgroundColor: activeTab === 'clasificados' ? '#4F46E5' : '#FFFFFF',
            color: activeTab === 'clasificados' ? '#FFFFFF' : '#0B132B',
            borderColor: activeTab === 'clasificados' ? '#4F46E5' : '#E2E8F0',
            boxShadow: activeTab === 'clasificados' ? '0 8px 20px -6px rgba(79,70,229,0.35)' : '0 1px 3px rgba(11,19,43,0.04)',
          }}
        >
          📢 Clasificados
        </button>
      </div>

      {activeTab === 'estado' && (
        <div style={{ maxWidth: '1240px', margin: '0 auto 20px auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: '20px', padding: '20px', boxShadow: '0 8px 24px -8px rgba(11, 19, 43, 0.06)' }}>
          <h3 style={{ margin: '0 0 6px', color: '#0B132B', fontSize: '16px', fontWeight: 800 }}>🌐 Importar convocatoria desde una URL</h3>
          <p style={{ margin: '0 0 14px', color: '#64748B', fontSize: '13px', fontWeight: 500 }}>
            Pega el enlace de detalle. La información se extrae como borrador y no se publica automáticamente.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input
              type="url"
              value={scrapeUrl}
              onChange={(e) => setScrapeUrl(e.target.value)}
              placeholder="https://www.convocatoriasdetrabajo.com/oportunidad-laboral-...html"
              style={{ ...styles.input, flex: '1 1 360px', minWidth: '220px' }}
            />
            <button
              type="button"
              onClick={importarConvocatoria}
              disabled={scrapeLoading}
              style={{ ...styles.btnPrimary, flex: '0 0 auto', padding: '11px 22px', opacity: scrapeLoading ? 0.65 : 1, cursor: scrapeLoading ? 'wait' : 'pointer' }}
            >
              {scrapeLoading ? '⏳ Analizando...' : '🔎 Extraer datos'}
            </button>
          </div>
          {scrapeError && <p style={{ color: '#DC2626', margin: '10px 0 0', fontSize: '13px', fontWeight: 700 }}>{scrapeError}</p>}
          {scrapeResult && (
            <div style={{
              marginTop: '16px',
              padding: '18px',
              background: 'linear-gradient(135deg, #FFFFFF 0%, #F0FDF9 100%)',
              border: '1px solid #A7F3D0',
              borderTop: '4px solid #06D6A0',
              borderRadius: '16px',
              boxShadow: '0 8px 24px rgba(11, 19, 43, 0.06)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
                <p style={{ margin: 0, color: '#065F46', fontWeight: 800, fontSize: '15px' }}>
                  ✅ Extracción completada
                </p>
                <span style={{
                  background: '#D1FAE5',
                  color: '#065F46',
                  border: '1px solid #6EE7B7',
                  borderRadius: '999px',
                  padding: '5px 12px',
                  fontSize: '11px',
                  fontWeight: 800
                }}>
                  {scrapeResult.camposDetectados ?? 'Datos'}{scrapeResult.totalCamposClave ? ` / ${scrapeResult.totalCamposClave} campos clave` : ' detectados'}
                </span>
              </div>

              <p style={{
                margin: '0 0 14px',
                padding: '10px 12px',
                color: '#92400E',
                background: '#FFFBEB',
                border: '1px solid #FDE68A',
                borderRadius: '10px',
                fontSize: '12px',
                fontWeight: 700
              }}>
                ⚠️ {scrapeResult.advertencia || 'Revisa fechas, remuneración, requisitos y procedimiento antes de guardar.'}
              </p>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))',
                gap: '10px',
                marginBottom: '12px'
              }}>
                {[
                  ['Entidad pública', scrapeResult.data?.empresa, '#EFF6FF', '#1D4ED8', '#BFDBFE'],
                  ['Puesto', scrapeResult.data?.titulo, '#ECFDF5', '#047857', '#A7F3D0'],
                  ['Modalidad', scrapeResult.data?.modalidad, '#F5F3FF', '#6D28D9', '#DDD6FE'],
                  ['Vacantes', scrapeResult.data?.vacantes, '#FDF2F8', '#BE185D', '#FBCFE8'],
                  ['Remuneración', scrapeResult.data?.sueldo, '#ECFEFF', '#0E7490', '#A5F3FC'],
                  ['Fecha de inicio', scrapeResult.data?.fechaInicio, '#F0FDF4', '#15803D', '#BBF7D0'],
                  ['Fecha de cierre', scrapeResult.data?.fechaVencimiento, '#FEF2F2', '#B91C1C', '#FECACA'],
                  ['Hora límite', scrapeResult.data?.horaVencimiento, '#F8FAFC', '#334155', '#CBD5E1']
                ].map(([label, value, fondo, color, borde]) => (
                  <div key={label} style={{
                    background: fondo,
                    border: `1px solid ${borde}`,
                    borderLeft: `4px solid ${color}`,
                    padding: '10px 12px',
                    borderRadius: '12px',
                    minWidth: 0
                  }}>
                    <div style={{ color, fontSize: '10px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.35px', marginBottom: '4px' }}>
                      {label}
                    </div>
                    <div style={{ color: '#0B132B', fontSize: '13px', fontWeight: 800, lineHeight: 1.4, overflowWrap: 'anywhere' }}>
                      {value || 'No detectado'}
                    </div>
                  </div>
                ))}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
                gap: '10px',
                marginBottom: '14px'
              }}>
                {[
                  ['Formación académica', scrapeResult.data?.formacion, '#EFF6FF', '#1D4ED8', '#BFDBFE'],
                  ['Experiencia requerida', scrapeResult.data?.experiencia, '#F5F3FF', '#6D28D9', '#DDD6FE'],
                  ['Cursos / especialización', scrapeResult.data?.especializacion, '#ECFDF5', '#047857', '#A7F3D0'],
                  ['¿Cómo postular?', scrapeResult.data?.comoPostular, '#FFFBEB', '#B45309', '#FDE68A']
                ].map(([label, value, fondo, color, borde]) => (
                  <div key={label} style={{
                    background: fondo,
                    border: `1px solid ${borde}`,
                    borderRadius: '12px',
                    padding: '12px',
                    minWidth: 0
                  }}>
                    <div style={{ color, fontSize: '11px', fontWeight: 800, marginBottom: '6px' }}>
                      {label}
                    </div>
                    <div style={{
                      color: '#0B132B',
                      fontSize: '12px',
                      fontWeight: 600,
                      lineHeight: 1.55,
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere',
                      maxHeight: '190px',
                      overflowY: 'auto'
                    }}>
                      {value || 'No detectado. Completar manualmente.'}
                    </div>
                  </div>
                ))}
              </div>

              <button type="button" onClick={pasarImportacionAlFormulario} style={{
                ...styles.btnPrimary,
                flex: '1 1 100%',
                background: 'linear-gradient(90deg, #06D6A0 0%, #34D399 100%)',
                color: '#0B132B',
                boxShadow: '0 6px 16px rgba(6, 214, 160, 0.25)'
              }}>
                ⬇️ Pasar datos al formulario
              </button>

              <p style={{ margin: '10px 0 0', color: '#475569', fontSize: '12px', fontWeight: 600, lineHeight: 1.5 }}>
                Los datos pasarán al formulario para que puedas corregirlos. El sistema detectará automáticamente el logo y los anexos. No se guardará nada hasta que pulses publicar.
              </p>
            </div>
          )}
        </div>
      )}

      <div id="formulario-convocatoria" style={styles.mainGrid}>
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <h2 style={styles.cardTitle}>
              {editingId ? '✏️ Modificar Registro' : (activeTab === 'estado' ? '🏛️ Nueva Convocatoria' : activeTab === 'privado' ? '💼 Nuevo Empleo Local' : '📢 Nuevo Anuncio Clasificado')}
            </h2>
          </div>

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* ================= ESTADO ================= */}
            {activeTab === 'estado' ? (
              <>
                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Entidad Pública</label>
                    <input type="text" name="empresa" value={formData.empresa} onChange={handleChange} placeholder="Ej. Gobierno Regional de Pasco" style={styles.input} required />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Modalidad / Régimen</label>
                    <select name="modalidad" value={formData.modalidad} onChange={handleChange} style={styles.input}>
                      <option value="CAS">CAS (Contratación Admin. Serv.)</option>
                      <option value="728">Régimen Privado (D.L. 728)</option>
                      <option value="276">Carrera Admin. (D.L. 276)</option>
                      <option value="Locación">Locación de Servicios</option>
                      <option value="Prácticas">Prácticas</option>
                      <option value="Servicio Civil">Servicio Civil (Ley 30057)</option>
                      <option value="CAP">CAP (Cuadro Asignación Personal)</option>
                      <option value="PAC">PAC (Personal Altamente Calificado)</option>
                      <option value="Terceros">Terceros / Consultoría</option>
                      <option value="FAG">FAG (Fondo Apoyo Gerencial)</option>
                      <option value="Suplencia">Suplencia / Reemplazo</option>
                    </select>
                  </div>
                </div>

                <div style={styles.row}>
                  <div style={styles.field}>
                    <label style={styles.label}>Logo (URL Imagen - ¡Se auto-rellena!)</label>
                    <input type="url" name="logo" value={formData.logo} onChange={handleChange} placeholder="https://.../logo.png" style={{...styles.input, backgroundColor: '#F0F9FF', borderColor: '#BAE6FD'}} />
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

                <div style={{ ...styles.field, backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                  <label style={{ ...styles.label, marginBottom: '8px', color: '#0B132B' }}>🔗 Enlaces Oficiales (Bases, PDF)</label>
                  <div style={{ marginBottom: '8px' }}>
                    <input type="url" name="enlaceBases" value={formData.enlaceBases} onChange={handleChange} placeholder="Enlace principal (Bases)" style={styles.input} />
                  </div>

                  {formData.enlacesExtras.map((item, index) => (
                    <div key={index} style={{ display: 'flex', gap: '6px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <input
                        type="text"
                        placeholder="Ej. Comunicado"
                        value={item.titulo}
                        onChange={(e) => handleExtraLinkChange(index, 'titulo', e.target.value)}
                        style={{ ...styles.input, flex: '1 1 110px' }}
                      />
                      <input
                        type="url"
                        placeholder="https://..."
                        value={item.url}
                        onChange={(e) => handleExtraLinkChange(index, 'url', e.target.value)}
                        style={{ ...styles.input, flex: '1 1 150px' }}
                      />
                      <button type="button" onClick={() => eliminarFilaEnlace(index)} style={{ ...styles.btnDeleteRow, flex: '0 0 auto' }}>✕ Quitar</button>
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

                <div style={{ ...styles.field, backgroundColor: '#F8FAFC', padding: '14px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
                  <label style={styles.label}>Modalidad de Trabajo</label>
                  <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '8px' }}>
                    {[
                      'Tiempo Completo',
                      'Medio Tiempo',
                      'CAS',
                      'Por Horas',
                      'Fines de Semana',
                      'Prácticas',
                      'Sistema 14x7'
                    ].map(mod => (
                      <label key={mod} style={{ fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: '#0B132B', backgroundColor: '#FFFFFF', padding: '5px 10px', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
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

                <div style={{ ...styles.field, backgroundColor: '#ECFDF5', padding: '14px', borderRadius: '14px', border: '1px solid #A7F3D0' }}>
                  <label style={{ ...styles.label, color: '#065F46', marginBottom: '8px' }}>📱 WhatsApp Contacto</label>
                  {formData.contactos.map((numero, index) => (
                    <div key={index} style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}>
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
                        <button type="button" onClick={() => setFormData({ ...formData, contactos: formData.contactos.filter((_, i) => i !== index) })} style={{ ...styles.btnDeleteRow, flex: '0 0 auto' }}>✕ Quitar</button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={() => setFormData({ ...formData, contactos: [...formData.contactos, ''] })} style={styles.btnAddRow}>+ Agregar otro número</button>
                </div>
              </>
            ) : (
              /* ================= CLASIFICADOS ================= */
              <>
                <div style={{ backgroundColor: categoriaActual.fondo, border: `1px solid ${categoriaActual.borde}`, borderLeft: `5px solid ${categoriaActual.color}`, borderRadius: '16px', padding: '16px', marginBottom: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <span style={{ fontSize: '24px' }}>{categoriaActual.icono}</span>
                    <div><div style={{ fontSize: '10px', fontWeight: '800', color: categoriaActual.color, letterSpacing: '0.5px' }}>CATEGORÍA DEL ANUNCIO</div><div style={{ fontSize: '16px', fontWeight: '800', color: '#0B132B' }}>{formData.categoriaClasificado}</div></div>
                  </div>
                  <div style={styles.row}>
                    <div style={styles.field}><label style={styles.label}>Título del Anuncio</label><input type="text" name="titulo" value={formData.titulo} onChange={handleChange} placeholder={formData.categoriaClasificado === 'Vehículos' ? 'Ej. Toyota Corolla 2022' : formData.categoriaClasificado === 'Viviendas en alquiler' ? 'Ej. Departamento en alquiler de 3 dormitorios' : formData.categoriaClasificado === 'Servicios' ? 'Ej. Servicio de fotografía y video' : formData.categoriaClasificado === 'Ventas' ? 'Ej. Laptop Lenovo en venta' : 'Ej. Alquiler de local comercial'} style={{ ...styles.input, borderColor: categoriaActual.borde }} required /></div>
                    <div style={styles.field}><label style={styles.label}>Categoría</label><select name="categoriaClasificado" value={formData.categoriaClasificado} onChange={handleChange} style={{ ...styles.input, borderColor: categoriaActual.color, fontWeight: '800' }}><option value="Locales en alquiler">🏪 Locales en alquiler</option><option value="Viviendas en alquiler">🏠 Viviendas en alquiler</option><option value="Vehículos">🚗 Vehículos</option><option value="Servicios">🛠️ Servicios</option><option value="Ventas">🏷️ Ventas</option><option value="Otros">📌 Otros</option></select></div>
                  </div>
                  <div style={{ marginTop: '12px', padding: '14px', backgroundColor: '#FFFFFF', borderRadius: '12px', border: `1px solid ${categoriaActual.borde}` }}>
                    <div style={{ color: categoriaActual.color, fontSize: '12px', fontWeight: '800', marginBottom: '10px' }}>{categoriaActual.icono} {categoriaActual.titulo}</div>
                    <div style={styles.row}>{categoriaActual.campos.map(renderCampoClasificado)}{renderLocationField()}</div>
                  </div>
                </div>
                <div style={styles.row}><div style={styles.field}><label style={styles.label}>Fecha de Vencimiento (Autoborrado)</label><input type="date" name="fechaVencimiento" value={formData.fechaVencimiento} onChange={handleChange} style={{ ...styles.input, borderColor: categoriaActual.borde }} /></div></div>
                <div style={{ ...styles.field, backgroundColor: '#FFFBEB', padding: '14px', borderRadius: '14px', border: '1px solid #FDE68A' }}>
                  <label style={{ ...styles.label, color: '#92400E', marginBottom: '8px' }}>📱 WhatsApp del Anunciante</label>
                  {formData.contactos.map((numero, index) => (<div key={index} style={{ display: 'flex', gap: '6px', marginBottom: '6px', flexWrap: 'wrap' }}><input type="text" placeholder={`Ej. 987654321 (#${index + 1})`} value={numero} onChange={(e) => { const nuevos = [...formData.contactos]; nuevos[index] = e.target.value; setFormData({ ...formData, contactos: nuevos }); }} style={{ ...styles.input, flex: '1 1 120px', backgroundColor: '#FFFFFF' }} required={index === 0} />{formData.contactos.length > 1 && (<button type="button" onClick={() => setFormData({ ...formData, contactos: formData.contactos.filter((_, i) => i !== index) })} style={{ ...styles.btnDeleteRow, flex: '0 0 auto' }}>✕ Quitar</button>)}</div>))}
                  <button type="button" onClick={() => setFormData({ ...formData, contactos: [...formData.contactos, ''] })} style={styles.btnAddRow}>+ Agregar otro número</button>
                </div>
              </>
            )}

            <div style={styles.field}>
              <label style={styles.label}>Descripción / Notas</label>
              <textarea name="descripcion" value={formData.descripcion} onChange={handleChange} style={styles.textarea} />
            </div>

            <div style={styles.vipContainer}>
              <input type="checkbox" id="esVip" name="esVip" checked={formData.esVip} onChange={handleChange} style={{ accentColor: '#D97706', width: '16px', height: '16px' }} />
              <label htmlFor="esVip" style={styles.vipLabel}>⭐ Destacar Anuncio en Sección VIP</label>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={styles.cardTitle}>{mostrarVencidos ? '🗄️ Historial (Vencidos)' : '📋 Registros Activos'}</h2>
              <span style={styles.counterBadge}>{displayJobsList.length}</span>
            </div>

            <button
              type="button"
              onClick={() => setMostrarVencidos(!mostrarVencidos)}
              style={{
                ...styles.btnManual,
                backgroundColor: mostrarVencidos ? '#0B132B' : '#FEF2F2',
                color: mostrarVencidos ? '#06D6A0' : '#991B1B',
                border: mostrarVencidos ? '1px solid #0B132B' : '1px solid #FECACA',
                padding: '7px 14px'
              }}
            >
              {mostrarVencidos ? '👀 Volver a Activos' : '🗑️ Ver Vencidos'}
            </button>
          </div>

          <div style={styles.scrollList}>
            {displayJobsList.length === 0 && (
              <p style={{ textAlign: 'center', color: '#64748B', fontSize: '13px', padding: '28px 0', fontWeight: 600 }}>
                No hay anuncios {mostrarVencidos ? 'vencidos' : 'activos'} en esta categoría.
              </p>
            )}

            {displayJobsList.map((job) => (
              <div key={job._id} style={{ ...styles.itemCard, opacity: job.isExpired ? 0.78 : 1, borderColor: job.esVip ? '#FBBF24' : '#E2E8F0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ ...styles.tagModality, backgroundColor: job.tipo === 'Clasificado' ? (categoriasClasificados[job.categoriaClasificado]?.color || '#4F46E5') : '#0B132B' }}>
                        {job.tipo === 'Clasificado' ? `${categoriasClasificados[job.categoriaClasificado]?.icono || '📌'} ${job.categoriaClasificado}` : job.tipo}
                      </span>
                      {job.esVip && (
                        <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#FFFBEB', color: '#B45309', border: '1px solid #FDE68A', padding: '2px 8px', borderRadius: '999px' }}>
                          ⭐ VIP
                        </span>
                      )}
                    </div>
                    <h3 style={styles.itemTitle}>{job.titulo}</h3>
                    <p style={styles.itemMeta}><strong>{job.tipo === 'Clasificado' ? 'Clasificado' : job.empresa}</strong> • 📍 {job.ubicacion}</p>
                  </div>
                  {job.isExpired && (
                    <span style={{ fontSize: '10px', fontWeight: '800', color: '#991B1B', backgroundColor: '#FEF2F2', padding: '4px 9px', borderRadius: '999px', border: '1px solid #FECACA', whiteSpace: 'nowrap' }}>
                      🔴 VENCIDO
                    </span>
                  )}
                </div>

                <div style={styles.itemFooterRow}>
                  <span style={styles.itemSalary}>{job.sueldo || 'A tratar'}</span>
                  <div style={styles.itemButtons}>
                    {!job.isExpired && (
                      <button
                        onClick={() => {
                          const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://chambafija.vercel.app';
                          const url = `${baseUrl}/oferta/${job._id}`;
                          const text = `🚨 *Nueva Oferta*\n🏢 ${job.empresa}\n💼 ${job.titulo}\n📍 ${job.ubicacion}\n\n👉 Postula aquí: ${url}`;
                          window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
                        }}
                        style={{ ...styles.btnEdit, backgroundColor: '#06D6A0', color: '#0B132B', borderColor: '#06D6A0', fontWeight: '800' }}
                      >
                        📲 Compartir
                      </button>
                    )}

                    <button
                      onClick={() => handleEdit(job)}
                      style={{ ...styles.btnEdit, borderColor: '#CBD5E1', backgroundColor: '#F8FAFC' }}
                    >
                      {job.isExpired ? 'Renovar (Editar)' : 'Editar'}
                    </button>

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
  wrapper: { padding: 'clamp(12px, 3vw, 28px)', backgroundColor: '#F4F7FB', minHeight: '100vh', fontFamily: 'var(--font-jakarta), system-ui, sans-serif' },
  tabNav: { display: 'flex', gap: '10px', marginBottom: '20px', maxWidth: '1240px', margin: '0 auto 20px auto', flexWrap: 'wrap' },
  tabBtn: { flex: '1 1 30%', padding: '14px 16px', borderRadius: '16px', borderWidth: '1px', borderStyle: 'solid', fontWeight: '800', fontSize: 'clamp(12px, 3.5vw, 14px)', cursor: 'pointer', transition: 'all 0.2s ease', textAlign: 'center' },
  mainGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '20px', maxWidth: '1240px', margin: '0 auto' },
  card: { backgroundColor: '#FFFFFF', padding: 'clamp(16px, 4vw, 28px)', borderRadius: '24px', boxShadow: '0 10px 30px -10px rgba(11, 19, 43, 0.07)', border: '1px solid #E2E8F0' },
  cardHeader: { marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px' },
  cardTitle: { fontSize: 'clamp(15px, 4vw, 18px)', fontWeight: '800', color: '#0B132B', margin: 0 },
  form: { display: 'flex', flexDirection: 'column', gap: '14px' },
  row: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  field: { display: 'flex', flexDirection: 'column', gap: '5px', flex: '1 1 140px', minWidth: 0 },
  label: { fontSize: '11px', fontWeight: '800', color: '#334155', letterSpacing: '0.2px' },
  input: { padding: '10px 13px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '600', color: '#0B132B', outline: 'none', backgroundColor: '#F8FAFC', width: '100%', boxSizing: 'border-box', transition: 'border-color 0.2s' },
  textarea: { padding: '10px 13px', borderRadius: '12px', border: '1px solid #CBD5E1', fontSize: '13px', fontWeight: '600', color: '#0B132B', outline: 'none', backgroundColor: '#F8FAFC', width: '100%', boxSizing: 'border-box', minHeight: '84px', resize: 'vertical' },
  btnManual: { padding: '9px 12px', backgroundColor: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '12px', fontWeight: '800', fontSize: '12px', cursor: 'pointer', color: '#0B132B', flex: '0 0 auto', textAlign: 'center' },
  vipContainer: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', backgroundColor: '#FFFBEB', borderRadius: '14px', border: '1px solid #FDE68A', flexWrap: 'wrap' },
  vipLabel: { fontSize: '13px', fontWeight: '800', color: '#92400E', cursor: 'pointer', flex: '1 1 auto' },
  btnGroup: { display: 'flex', gap: '10px', marginTop: '6px', flexWrap: 'wrap' },
  btnPrimary: { flex: '1 1 100%', padding: '14px', backgroundColor: '#0B132B', color: '#FFFFFF', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '14px', cursor: 'pointer', boxShadow: '0 8px 18px -6px rgba(11,19,43,0.3)' },
  btnSecondary: { flex: '1 1 100%', padding: '13px', backgroundColor: '#64748B', color: '#FFFFFF', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '13px', cursor: 'pointer' },
  listHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #F1F5F9', paddingBottom: '12px', flexWrap: 'wrap', gap: '8px' },
  counterBadge: { fontSize: '12px', backgroundColor: '#0B132B', color: '#06D6A0', padding: '3px 11px', borderRadius: '999px', fontWeight: '800' },
  scrollList: { display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '72vh', overflowY: 'auto', paddingRight: '4px' },
  itemCard: { padding: '16px', borderRadius: '16px', backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', boxShadow: '0 2px 8px rgba(11,19,43,0.04)' },
  tagModality: { fontSize: '10px', fontWeight: '800', backgroundColor: '#0B132B', color: '#FFFFFF', padding: '3px 9px', borderRadius: '999px', display: 'inline-block' },
  itemTitle: { fontSize: '14px', fontWeight: '800', color: '#0B132B', margin: '0 0 4px 0', lineHeight: '1.3' },
  itemMeta: { fontSize: '12px', color: '#64748B', margin: 0, fontWeight: '600' },
  itemFooterRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #F1F5F9', flexWrap: 'wrap', gap: '8px' },
  itemSalary: { fontSize: '14px', fontWeight: '800', color: '#059669' },
  itemButtons: { display: 'flex', gap: '6px', flexWrap: 'wrap', flex: '1 1 auto', justifyContent: 'flex-end' },
  btnEdit: { padding: '7px 13px', fontSize: '11px', fontWeight: '800', backgroundColor: '#F8FAFC', color: '#0B132B', border: '1px solid #CBD5E1', borderRadius: '10px', cursor: 'pointer', flex: '0 1 auto', textAlign: 'center' },
  btnDelete: { padding: '7px 13px', fontSize: '11px', fontWeight: '800', backgroundColor: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: '10px', cursor: 'pointer', flex: '0 1 auto', textAlign: 'center' },
  btnAddRow: { background: 'none', border: 'none', color: '#059669', fontSize: '12px', fontWeight: '800', cursor: 'pointer', padding: '4px 0', textAlign: 'left', width: '100%' },
  btnDeleteRow: { background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '10px', color: '#DC2626', fontWeight: '800', fontSize: '12px', cursor: 'pointer', padding: '6px 10px', textAlign: 'center' }
};