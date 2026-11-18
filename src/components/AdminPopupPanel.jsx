'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { resolverImagenDrive } from '@/lib/driveImage';

const POPUP_INICIAL = {
  activo: true,
  nombre: '',
  subtitulo: '',
  etiqueta: '🔥 Promo Rápida · Pasco',
  imagen: '',
  formato: 'cuadrado',
  textoBoton: '📲 Consultar por WhatsApp',
  whatsapp: '',
  mensaje: 'Hola, vi su anuncio en ChambaFija y quisiera más información.',
  enlace: '',
  activoHasta: '',
};

const PORTADA_INICIAL = {
  activo: true,
  nombre: '',
  rubro: '',
  promo: '',
  imagen: '',
  imagenMovil: '',
  whatsapp: '',
  mensaje: 'Hola, vi su publicidad en portada de ChambaFija y quisiera información.',
  enlace: '',
  activoHasta: '',
  orden: 1,
};

const formatearUltimoClic = (iso) => {
  if (!iso) return 'Sin clics aún';
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return 'Sin clics aún';
  return fecha.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export default function AdminPopupPanel() {
  const [subTab, setSubTab] = useState('popup'); // 'popup' | 'portada'
  const [ads, setAds] = useState([]);
  const [portadaAds, setPortadaAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [editingPopupId, setEditingPopupId] = useState(null);
  const [editingPortadaId, setEditingPortadaId] = useState(null);
  const [previewError, setPreviewError] = useState(false);

  const [config, setConfig] = useState({
    habilitado: true,
    modo: 'sesion',
    cadaMinutos: 30,
    retrasoMs: 600,
    mostrarBarraAnunciate: true,
    intervaloPortadaMs: 5500,
  });

  const [formPopup, setFormPopup] = useState(POPUP_INICIAL);
  const [formPortada, setFormPortada] = useState(PORTADA_INICIAL);

  const cargarTodo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/popup', { cache: 'no-store' });
      const data = await res.json();
      if (data.success) {
        if (data.config) setConfig(data.config);
        setAds(Array.isArray(data.ads) ? data.ads : []);
        setPortadaAds(Array.isArray(data.portadaAds) ? data.portadaAds : []);
      }
    } catch (err) {
      console.error('Error cargando publicidades:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarTodo();
  }, []);

  const resumenClics = useMemo(() => {
    const clicsPopup = ads.reduce((acc, item) => acc + (Number(item.clics) || 0), 0);
    const clicsPortada = portadaAds.reduce((acc, item) => acc + (Number(item.clics) || 0), 0);
    return {
      popup: clicsPopup,
      portada: clicsPortada,
      total: clicsPopup + clicsPortada,
    };
  }, [ads, portadaAds]);

  const guardarConfig = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/popup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'config', ...config }),
      });
      const data = await res.json();
      if (data.success) {
        alert('✅ Configuración guardada correctamente.');
      } else {
        alert('Error: ' + data.mensaje);
      }
    } catch {
      alert('Error de conexión al guardar configuración.');
    } finally {
      setSaving(false);
    }
  };

  const guardarPopup = async (e) => {
    e.preventDefault();
    if (!formPopup.imagen.trim()) {
      alert('Pega el enlace de Google Drive o URL de la imagen.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formPopup,
        coleccion: 'popup',
        imagen: resolverImagenDrive(formPopup.imagen, 1600),
      };

      const res = await fetch('/api/popup', {
        method: editingPopupId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingPopupId ? { id: editingPopupId, ...payload } : payload
        ),
      });

      const data = await res.json();
      if (data.success) {
        alert(editingPopupId ? '✅ Popup actualizado.' : '✅ Popup publicado.');
        setEditingPopupId(null);
        setFormPopup(POPUP_INICIAL);
        setPreviewError(false);
        cargarTodo();
      } else {
        alert('Error: ' + data.mensaje);
      }
    } catch {
      alert('Error de conexión.');
    } finally {
      setSaving(false);
    }
  };

  const guardarPortada = async (e) => {
    e.preventDefault();
    if (!formPortada.imagen.trim()) {
      alert('Pega el enlace de Google Drive o ruta de la imagen panorámica.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formPortada,
        coleccion: 'portada',
        imagen: resolverImagenDrive(formPortada.imagen, 2000),
        imagenMovil: formPortada.imagenMovil
          ? resolverImagenDrive(formPortada.imagenMovil, 1200)
          : '',
      };

      const res = await fetch('/api/popup', {
        method: editingPortadaId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(
          editingPortadaId ? { id: editingPortadaId, ...payload } : payload
        ),
      });

      const data = await res.json();
      if (data.success) {
        alert(
          editingPortadaId
            ? '✅ Banner de portada actualizado.'
            : '✅ Banner de portada publicado.'
        );
        setEditingPortadaId(null);
        setFormPortada(PORTADA_INICIAL);
        setPreviewError(false);
        cargarTodo();
      } else {
        alert('Error: ' + data.mensaje);
      }
    } catch {
      alert('Error de conexión.');
    } finally {
      setSaving(false);
    }
  };

  const toggleActivo = async (ad, coleccion) => {
    try {
      await fetch('/api/popup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad._id, coleccion, activo: !ad.activo }),
      });
      cargarTodo();
    } catch {
      alert('No se pudo cambiar el estado.');
    }
  };

  const reiniciarClicsAd = async (ad, coleccion) => {
    if (
      !window.confirm(
        `¿Reiniciar el contador de clics de "${ad.nombre || 'este anuncio'}" a 0?`
      )
    ) {
      return;
    }
    try {
      await fetch('/api/popup', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: ad._id, coleccion, reiniciarClics: true }),
      });
      cargarTodo();
    } catch {
      alert('No se pudo reiniciar el contador.');
    }
  };

  const eliminarAd = async (id, coleccion) => {
    if (!window.confirm('¿Eliminar definitivamente este anuncio?')) return;
    try {
      await fetch(
        `/api/popup?id=${encodeURIComponent(id)}&coleccion=${coleccion}`,
        { method: 'DELETE' }
      );
      cargarTodo();
    } catch {
      alert('Error al eliminar.');
    }
  };

  const previewPopupUrl = resolverImagenDrive(formPopup.imagen, 1600);
  const previewPortadaUrl = resolverImagenDrive(formPortada.imagen, 2000);

  const previewPopupStyle =
    formPopup.formato === 'cuadrado'
      ? { aspectRatio: '1 / 1', objectFit: 'cover' }
      : formPopup.formato === 'vertical'
      ? { aspectRatio: '4 / 5', objectFit: 'cover' }
      : formPopup.formato === 'horizontal'
      ? { aspectRatio: '16 / 9', objectFit: 'cover' }
      : { maxHeight: '260px', objectFit: 'contain' };

  return (
    <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* RESUMEN DE CLICS PUBLICITARIOS */}
      <div style={{ ...s.card, background: 'linear-gradient(135deg, #0B132B 0%, #132246 100%)', color: '#FFFFFF', border: '1px solid #1E293B' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '16px', fontWeight: 800, color: '#FFFFFF' }}>
              📊 Rendimiento de Publicidad (Clics Reales)
            </h2>
            <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>
              Cada toque en la imagen o botón de WhatsApp/enlace suma automáticamente.
            </p>
          </div>
          <button
            type="button"
            onClick={cargarTodo}
            disabled={loading}
            style={{
              padding: '8px 14px',
              borderRadius: '12px',
              border: '1px solid rgba(6,214,160,0.4)',
              background: 'rgba(6,214,160,0.12)',
              color: '#06D6A0',
              fontSize: '12px',
              fontWeight: 800,
              cursor: loading ? 'wait' : 'pointer',
            }}
          >
            {loading ? '⏳ Actualizando...' : '🔄 Actualizar clics'}
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '12px 14px' }}>
            <span style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: 700, display: 'block' }}>⚡ Clics en Popups</span>
            <span style={{ fontSize: '24px', fontWeight: 900, color: '#FBBF24' }}>{resumenClics.popup.toLocaleString('es-PE')}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '12px 14px' }}>
            <span style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: 700, display: 'block' }}>🖼️ Clics en Portada</span>
            <span style={{ fontSize: '24px', fontWeight: 900, color: '#06D6A0' }}>{resumenClics.portada.toLocaleString('es-PE')}</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '14px', padding: '12px 14px' }}>
            <span style={{ fontSize: '11px', color: '#CBD5E1', fontWeight: 700, display: 'block' }}>👆 Total de Clics</span>
            <span style={{ fontSize: '24px', fontWeight: 900, color: '#FFFFFF' }}>{resumenClics.total.toLocaleString('es-PE')}</span>
          </div>
        </div>
      </div>

      {/* SELECTOR DE SUB-PESTAÑAS */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          type="button"
          onClick={() => {
            setSubTab('popup');
            setPreviewError(false);
          }}
          style={{
            flex: '1 1 240px',
            padding: '13px 16px',
            borderRadius: '16px',
            border: subTab === 'popup' ? '2px solid #D97706' : '1px solid #CBD5E1',
            background: subTab === 'popup' ? '#FFFBEB' : '#FFFFFF',
            color: subTab === 'popup' ? '#92400E' : '#334155',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          ⚡ Popup Emergente ({ads.filter((a) => a.activo).length} activos · {resumenClics.popup} clics)
        </button>

        <button
          type="button"
          onClick={() => {
            setSubTab('portada');
            setPreviewError(false);
          }}
          style={{
            flex: '1 1 240px',
            padding: '13px 16px',
            borderRadius: '16px',
            border: subTab === 'portada' ? '2px solid #059669' : '1px solid #CBD5E1',
            background: subTab === 'portada' ? '#ECFDF5' : '#FFFFFF',
            color: subTab === 'portada' ? '#065F46' : '#334155',
            fontWeight: 800,
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          🖼️ Carrusel de Portada ({portadaAds.filter((a) => a.activo).length} activos · {resumenClics.portada} clics)
        </button>
      </div>

      {/* ======================================================
          VISTA 1: POPUP EMERGENTE
          ====================================================== */}
      {subTab === 'popup' ? (
        <>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
              <div>
                <h2 style={s.title}>⚙️ Comportamiento del Popup Emergente</h2>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                  Define cuándo sale el anuncio central y actívalo o apágalo con 1 clic.
                </p>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', background: config.habilitado ? '#ECFDF5' : '#FEF2F2', border: `1px solid ${config.habilitado ? '#A7F3D0' : '#FECACA'}`, padding: '8px 14px', borderRadius: '12px', cursor: 'pointer', fontSize: '12px', fontWeight: 800, color: config.habilitado ? '#065F46' : '#991B1B' }}>
                <input
                  type="checkbox"
                  checked={config.habilitado}
                  onChange={(e) => setConfig({ ...config, habilitado: e.target.checked })}
                  style={{ accentColor: '#059669', width: '16px', height: '16px' }}
                />
                {config.habilitado ? '🟢 Popup Activado' : '🔴 Popup Apagado'}
              </label>
            </div>

            <div style={s.row}>
              <div style={s.field}>
                <label style={s.label}>¿Cuándo debe aparecer?</label>
                <select
                  value={config.modo}
                  onChange={(e) => setConfig({ ...config, modo: e.target.value })}
                  style={s.input}
                >
                  <option value="sesion">1 vez al entrar (Recomendado · no fastidia)</option>
                  <option value="minutos">Cada ciertos minutos</option>
                  <option value="siempre">En cada recarga de página</option>
                </select>
              </div>

              {config.modo === 'minutos' && (
                <div style={s.field}>
                  <label style={s.label}>Volver a mostrar cada (min)</label>
                  <input
                    type="number"
                    min="1"
                    value={config.cadaMinutos}
                    onChange={(e) => setConfig({ ...config, cadaMinutos: e.target.value })}
                    style={s.input}
                  />
                </div>
              )}

              <div style={s.field}>
                <label style={s.label}>Retraso al abrir (ms)</label>
                <input
                  type="number"
                  min="0"
                  step="100"
                  value={config.retrasoMs}
                  onChange={(e) => setConfig({ ...config, retrasoMs: e.target.value })}
                  style={s.input}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                <button type="button" onClick={guardarConfig} disabled={saving} style={{ ...s.btnPrimary, padding: '10px 20px', whiteSpace: 'nowrap' }}>
                  💾 Guardar ajustes
                </button>
              </div>
            </div>
          </div>

          <div style={s.grid}>
            <div style={s.card}>
              <h2 style={{ ...s.title, marginBottom: '14px' }}>
                {editingPopupId ? '✏️ Editar Popup' : '⚡ Nuevo Popup (Drive / URL)'}
              </h2>

              <form onSubmit={guardarPopup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '14px', padding: '12px' }}>
                  <label style={{ ...s.label, color: '#1D4ED8' }}>
                    🖼️ Enlace de Google Drive (o URL / ruta local)
                  </label>
                  <input
                    type="text"
                    value={formPopup.imagen}
                    onChange={(e) => {
                      setPreviewError(false);
                      setFormPopup({ ...formPopup, imagen: e.target.value });
                    }}
                    placeholder="https://drive.google.com/file/d/XXXX/view?usp=sharing"
                    style={{ ...s.input, background: '#FFFFFF', marginTop: '5px' }}
                    required
                  />
                  <p style={{ margin: '6px 0 0', fontSize: '11px', color: '#1E40AF', fontWeight: 600 }}>
                    💡 Drive: clic derecho → Compartir → <strong>Cualquier persona con el enlace</strong> → Copiar enlace.
                  </p>
                </div>

                <div style={s.row}>
                  <div style={s.field}>
                    <label style={s.label}>📐 Tamaño / Formato del Popup</label>
                    <select
                      value={formPopup.formato}
                      onChange={(e) => setFormPopup({ ...formPopup, formato: e.target.value })}
                      style={s.input}
                    >
                      <option value="cuadrado">⬛ Cuadrado 1:1 (1080×1080 · Ideal)</option>
                      <option value="vertical">📱 Vertical Flyer 4:5 (1080×1350)</option>
                      <option value="auto">✨ Automático (Sin recortes)</option>
                      <option value="horizontal">🖼️ Horizontal Compacto 16:9</option>
                    </select>
                  </div>

                  <div style={s.field}>
                    <label style={s.label}>🏷️ Etiqueta superior</label>
                    <input
                      type="text"
                      value={formPopup.etiqueta}
                      onChange={(e) => setFormPopup({ ...formPopup, etiqueta: e.target.value })}
                      style={s.input}
                    />
                  </div>
                </div>

                {previewPopupUrl && (
                  <div style={{ background: '#0B132B', borderRadius: '16px', padding: '12px', textAlign: 'center' }}>
                    <span style={{ display: 'block', fontSize: '10px', fontWeight: 800, color: '#06D6A0', marginBottom: '8px', textTransform: 'uppercase' }}>
                      Vista previa ({formPopup.formato})
                    </span>
                    {previewError ? (
                      <p style={{ color: '#FCA5A5', fontSize: '12px', fontWeight: 700, margin: '10px 0' }}>
                        ⚠️ No cargó. Verifica que en Google Drive esté en &quot;Cualquier persona con el enlace&quot;.
                      </p>
                    ) : (
                      <img
                        src={previewPopupUrl}
                        alt="Vista previa popup"
                        referrerPolicy="no-referrer"
                        onError={() => setPreviewError(true)}
                        style={{
                          width: '100%',
                          maxWidth: formPopup.formato === 'vertical' ? '220px' : '260px',
                          borderRadius: '12px',
                          margin: '0 auto',
                          display: 'block',
                          ...previewPopupStyle,
                        }}
                      />
                    )}
                  </div>
                )}

                <div style={s.row}>
                  <div style={s.field}>
                    <label style={s.label}>Nombre del Negocio</label>
                    <input type="text" value={formPopup.nombre} onChange={(e) => setFormPopup({ ...formPopup, nombre: e.target.value })} placeholder="Ej. Pollería El Fogón" style={s.input} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Subtítulo corto (opcional)</label>
                    <input type="text" value={formPopup.subtitulo} onChange={(e) => setFormPopup({ ...formPopup, subtitulo: e.target.value })} placeholder="Ej. Delivery gratis hoy" style={s.input} />
                  </div>
                </div>

                <div style={s.row}>
                  <div style={s.field}>
                    <label style={s.label}>📱 WhatsApp (9 dígitos)</label>
                    <input type="text" value={formPopup.whatsapp} onChange={(e) => setFormPopup({ ...formPopup, whatsapp: e.target.value })} placeholder="967576214" style={s.input} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Texto del Botón</label>
                    <input type="text" value={formPopup.textoBoton} onChange={(e) => setFormPopup({ ...formPopup, textoBoton: e.target.value })} style={s.input} />
                  </div>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Mensaje prellenado de WhatsApp</label>
                  <input type="text" value={formPopup.mensaje} onChange={(e) => setFormPopup({ ...formPopup, mensaje: e.target.value })} style={s.input} />
                </div>

                <div style={s.row}>
                  <div style={s.field}>
                    <label style={s.label}>🔗 Enlace libre (reemplaza WA)</label>
                    <input type="url" value={formPopup.enlace} onChange={(e) => setFormPopup({ ...formPopup, enlace: e.target.value })} placeholder="https://..." style={s.input} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>📅 Apagar automáticamente el</label>
                    <input type="date" value={formPopup.activoHasta} onChange={(e) => setFormPopup({ ...formPopup, activoHasta: e.target.value })} style={s.input} />
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 800, color: '#0B132B', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formPopup.activo} onChange={(e) => setFormPopup({ ...formPopup, activo: e.target.checked })} style={{ accentColor: '#059669', width: '16px', height: '16px' }} />
                  Activar inmediatamente
                </label>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" disabled={saving} style={{ ...s.btnPrimary, flex: 1 }}>
                    {saving ? 'Guardando...' : editingPopupId ? '💾 Guardar Cambios' : '🚀 Publicar Popup'}
                  </button>
                  {editingPopupId && (
                    <button type="button" onClick={() => { setEditingPopupId(null); setFormPopup(POPUP_INICIAL); }} style={s.btnSecondary}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h2 style={s.title}>⚡ Popups ({ads.length})</h2>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Si hay 2+ activos, rotan</span>
              </div>

              {loading ? (
                <p style={{ color: '#64748B', fontSize: '13px', fontWeight: 600 }}>Cargando...</p>
              ) : ads.length === 0 ? (
                <p style={{ color: '#64748B', fontSize: '13px', textAlign: 'center', padding: '32px 10px', fontWeight: 600 }}>
                  Aún no hay popups creados.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '72vh', overflowY: 'auto' }}>
                  {ads.map((ad) => (
                    <div key={ad._id} style={{ border: `1px solid ${ad.activo ? '#A7F3D0' : '#E2E8F0'}`, background: ad.activo ? '#F0FDF9' : '#F8FAFC', borderRadius: '16px', padding: '12px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <img src={resolverImagenDrive(ad.imagen, 400)} alt={ad.nombre || 'Popup'} referrerPolicy="no-referrer" style={{ width: '70px', height: '70px', borderRadius: '12px', objectFit: 'cover', border: '1px solid #CBD5E1', background: '#0B132B', flexShrink: 0 }} />
                      <div style={{ flex: '1 1 170px', minWidth: 0 }}>
                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                          <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', background: ad.activo ? '#059669' : '#64748B', color: '#FFFFFF' }}>{ad.activo ? 'ACTIVO' : 'PAUSADO'}</span>
                          <span style={{ fontSize: '10px', fontWeight: 900, padding: '2px 9px', borderRadius: '999px', background: '#0B132B', color: '#06D6A0' }}>
                            👆 {(Number(ad.clics) || 0).toLocaleString('es-PE')} clics
                          </span>
                          <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', background: '#E2E8F0', color: '#0B132B' }}>📐 {ad.formato || 'auto'}</span>
                          {ad.activoHasta && <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', background: '#FEF3C7', color: '#92400E' }}>⏳ {ad.activoHasta}</span>}
                        </div>
                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0B132B' }}>{ad.nombre || 'Sin título'}</p>
                        <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                          {ad.enlace ? '🔗 Enlace externo' : ad.whatsapp ? `📱 WA: ${ad.whatsapp}` : 'Solo visual'} · 🕒 {formatearUltimoClic(ad.ultimoClic)}
                        </p>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => toggleActivo(ad, 'popup')} style={{ ...s.btnSmall, background: ad.activo ? '#FEF3C7' : '#DCFCE7', color: ad.activo ? '#92400E' : '#166534', borderColor: ad.activo ? '#FDE68A' : '#86EFAC' }}>
                          {ad.activo ? '⏸️ Pausar' : '▶️ Activar'}
                        </button>
                        <button type="button" onClick={() => reiniciarClicsAd(ad, 'popup')} title="Reiniciar contador de clics a 0" style={{ ...s.btnSmall, background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' }}>
                          ↺ 0
                        </button>
                        <button type="button" onClick={() => { setEditingPopupId(ad._id); setPreviewError(false); setFormPopup({ ...POPUP_INICIAL, ...ad }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={s.btnSmall}>
                          Editar
                        </button>
                        <button type="button" onClick={() => eliminarAd(ad._id, 'popup')} style={{ ...s.btnSmall, background: '#FEF2F2', color: '#DC2626', borderColor: '#FECACA' }}>
                          Eliminar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        /* ======================================================
           VISTA 2: CARRUSEL PANORÁMICO DE PORTADA
           ====================================================== */
        <>
          <div style={s.card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h2 style={s.title}>⚙️ Velocidad del Carrusel de Portada</h2>
                <p style={{ margin: '3px 0 0', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                  Medida recomendada para portada: <strong>2000 × 750 px</strong> (o banner horizontal). También acepta rutas locales como <code>/PromosDelucesV4.jpg</code> o enlaces de Drive.
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <input
                  type="number"
                  min="2000"
                  step="500"
                  value={config.intervaloPortadaMs || 5500}
                  onChange={(e) => setConfig({ ...config, intervaloPortadaMs: e.target.value })}
                  style={{ ...s.input, width: '110px' }}
                  title="Milisegundos entre cada banner (5500 = 5.5 segundos)"
                />
                <button type="button" onClick={guardarConfig} disabled={saving} style={{ ...s.btnPrimary, padding: '10px 16px', whiteSpace: 'nowrap' }}>
                  💾 Guardar velocidad
                </button>
              </div>
            </div>
          </div>

          <div style={s.grid}>
            <div style={s.card}>
              <h2 style={{ ...s.title, marginBottom: '14px' }}>
                {editingPortadaId ? '✏️ Editar Banner de Portada' : '🖼️ Nuevo Banner Panorámico (Drive / URL)'}
              </h2>

              <form onSubmit={guardarPortada} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '14px', padding: '12px' }}>
                  <label style={{ ...s.label, color: '#065F46' }}>
                    🖼️ Imagen Principal PC / General (Google Drive o /archivo.jpg)
                  </label>
                  <input
                    type="text"
                    value={formPortada.imagen}
                    onChange={(e) => {
                      setPreviewError(false);
                      setFormPortada({ ...formPortada, imagen: e.target.value });
                    }}
                    placeholder="https://drive.google.com/file/d/XXXX/view o /PromosDelucesV4.jpg"
                    style={{ ...s.input, background: '#FFFFFF', marginTop: '5px' }}
                    required
                  />

                  <label style={{ ...s.label, color: '#065F46', marginTop: '10px', display: 'block' }}>
                    📱 Imagen exclusiva para Celular (Opcional · Drive o URL)
                  </label>
                  <input
                    type="text"
                    value={formPortada.imagenMovil}
                    onChange={(e) => setFormPortada({ ...formPortada, imagenMovil: e.target.value })}
                    placeholder="Déjalo vacío para usar la misma imagen en celular"
                    style={{ ...s.input, background: '#FFFFFF', marginTop: '5px' }}
                  />
                </div>

                {previewPortadaUrl && (
                  <div style={{ background: '#0B132B', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155' }}>
                    {previewError ? (
                      <p style={{ color: '#FCA5A5', fontSize: '12px', fontWeight: 700, padding: '16px', textAlign: 'center', margin: 0 }}>
                        ⚠️ No cargó la imagen. Verifica permisos públicos en Google Drive.
                      </p>
                    ) : (
                      <img
                        src={previewPortadaUrl}
                        alt="Vista previa portada"
                        referrerPolicy="no-referrer"
                        onError={() => setPreviewError(true)}
                        style={{ width: '100%', height: 'auto', display: 'block' }}
                      />
                    )}
                    <div style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                      <span style={{ color: '#FFFFFF', fontSize: '12px', fontWeight: 800 }}>
                        ⭐ {formPortada.nombre || 'Nombre del negocio'} {formPortada.rubro ? `· ${formPortada.rubro}` : ''}
                      </span>
                      <span style={{ background: '#06D6A0', color: '#0B132B', fontSize: '11px', fontWeight: 800, padding: '4px 10px', borderRadius: '8px' }}>
                        📲 Contactar
                      </span>
                    </div>
                  </div>
                )}

                <div style={s.row}>
                  <div style={s.field}>
                    <label style={s.label}>Nombre del Negocio</label>
                    <input type="text" value={formPortada.nombre} onChange={(e) => setFormPortada({ ...formPortada, nombre: e.target.value })} placeholder="Ej. Deluces Films" style={s.input} required />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>Rubro (opcional)</label>
                    <input type="text" value={formPortada.rubro} onChange={(e) => setFormPortada({ ...formPortada, rubro: e.target.value })} placeholder="Ej. Fotografía y Video" style={s.input} />
                  </div>
                </div>

                <div style={s.row}>
                  <div style={s.field}>
                    <label style={s.label}>Etiqueta Promo (opcional)</label>
                    <input type="text" value={formPortada.promo} onChange={(e) => setFormPortada({ ...formPortada, promo: e.target.value })} placeholder="Ej. 🔥 Promo exclusiva ChambaFija" style={s.input} />
                  </div>
                  <div style={{ ...s.field, flex: '0 1 110px' }}>
                    <label style={s.label}>Orden (1, 2, 3...)</label>
                    <input type="number" min="1" value={formPortada.orden} onChange={(e) => setFormPortada({ ...formPortada, orden: e.target.value })} style={s.input} />
                  </div>
                </div>

                <div style={s.row}>
                  <div style={s.field}>
                    <label style={s.label}>📱 WhatsApp (9 dígitos)</label>
                    <input type="text" value={formPortada.whatsapp} onChange={(e) => setFormPortada({ ...formPortada, whatsapp: e.target.value })} placeholder="967576214" style={s.input} />
                  </div>
                  <div style={s.field}>
                    <label style={s.label}>📅 Apagar automáticamente el</label>
                    <input type="date" value={formPortada.activoHasta} onChange={(e) => setFormPortada({ ...formPortada, activoHasta: e.target.value })} style={s.input} />
                  </div>
                </div>

                <div style={s.field}>
                  <label style={s.label}>Mensaje prellenado de WhatsApp</label>
                  <input type="text" value={formPortada.mensaje} onChange={(e) => setFormPortada({ ...formPortada, mensaje: e.target.value })} style={s.input} />
                </div>

                <div style={s.field}>
                  <label style={s.label}>🔗 Enlace libre (Opcional: reemplaza WhatsApp)</label>
                  <input type="url" value={formPortada.enlace} onChange={(e) => setFormPortada({ ...formPortada, enlace: e.target.value })} placeholder="https://..." style={s.input} />
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 800, color: '#0B132B', cursor: 'pointer' }}>
                  <input type="checkbox" checked={formPortada.activo} onChange={(e) => setFormPortada({ ...formPortada, activo: e.target.checked })} style={{ accentColor: '#059669', width: '16px', height: '16px' }} />
                  Mostrar inmediatamente en el carrusel de portada
                </label>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="submit" disabled={saving} style={{ ...s.btnPrimary, flex: 1 }}>
                    {saving ? 'Guardando...' : editingPortadaId ? '💾 Guardar Banner' : '🚀 Publicar en Portada'}
                  </button>
                  {editingPortadaId && (
                    <button type="button" onClick={() => { setEditingPortadaId(null); setFormPortada(PORTADA_INICIAL); }} style={s.btnSecondary}>
                      Cancelar
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div style={s.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h2 style={s.title}>🖼️ Banners de Portada ({portadaAds.length})</h2>
                <span style={{ fontSize: '11px', color: '#64748B', fontWeight: 700 }}>Ordenados por número</span>
              </div>

              {loading ? (
                <p style={{ color: '#64748B', fontSize: '13px', fontWeight: 600 }}>Cargando...</p>
              ) : portadaAds.length === 0 ? (
                <p style={{ color: '#64748B', fontSize: '13px', textAlign: 'center', padding: '32px 10px', fontWeight: 600 }}>
                  Aún no hay banners en Firebase. Agrega tus anuncios aquí (puedes usar <code>/PatitasSOSv1.jpg</code>, <code>/PromosDelucesV4.jpg</code> o links de Google Drive).
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '72vh', overflowY: 'auto' }}>
                  {portadaAds.map((ad) => (
                    <div key={ad._id} style={{ border: `1px solid ${ad.activo ? '#A7F3D0' : '#E2E8F0'}`, background: ad.activo ? '#F0FDF9' : '#F8FAFC', borderRadius: '16px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <img
                        src={resolverImagenDrive(ad.imagen, 800)}
                        alt={ad.nombre || 'Banner'}
                        referrerPolicy="no-referrer"
                        style={{ width: '100%', maxHeight: '115px', objectFit: 'cover', borderRadius: '10px', background: '#0B132B', border: '1px solid #CBD5E1' }}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '4px' }}>
                            <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', background: '#0B132B', color: '#FFFFFF' }}>#{ad.orden || 1}</span>
                            <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', background: ad.activo ? '#059669' : '#64748B', color: '#FFFFFF' }}>{ad.activo ? 'ACTIVO' : 'PAUSADO'}</span>
                            <span style={{ fontSize: '10px', fontWeight: 900, padding: '2px 9px', borderRadius: '999px', background: '#0B132B', color: '#06D6A0' }}>
                              👆 {(Number(ad.clics) || 0).toLocaleString('es-PE')} clics
                            </span>
                            {ad.activoHasta && <span style={{ fontSize: '10px', fontWeight: 800, padding: '2px 8px', borderRadius: '999px', background: '#FEF3C7', color: '#92400E' }}>⏳ {ad.activoHasta}</span>}
                          </div>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: '#0B132B' }}>{ad.nombre}</p>
                          <p style={{ margin: '2px 0 0', fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                            {ad.rubro || 'Sin rubro'} {ad.whatsapp ? `· 📱 ${ad.whatsapp}` : ''} · 🕒 {formatearUltimoClic(ad.ultimoClic)}
                          </p>
                        </div>

                        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                          <button type="button" onClick={() => toggleActivo(ad, 'portada')} style={{ ...s.btnSmall, background: ad.activo ? '#FEF3C7' : '#DCFCE7', color: ad.activo ? '#92400E' : '#166534', borderColor: ad.activo ? '#FDE68A' : '#86EFAC' }}>
                            {ad.activo ? '⏸️ Pausar' : '▶️ Activar'}
                          </button>
                          <button type="button" onClick={() => reiniciarClicsAd(ad, 'portada')} title="Reiniciar contador de clics a 0" style={{ ...s.btnSmall, background: '#EFF6FF', color: '#1D4ED8', borderColor: '#BFDBFE' }}>
                            ↺ 0
                          </button>
                          <button type="button" onClick={() => { setEditingPortadaId(ad._id); setPreviewError(false); setFormPortada({ ...PORTADA_INICIAL, ...ad }); window.scrollTo({ top: 0, behavior: 'smooth' }); }} style={s.btnSmall}>
                            Editar
                          </button>
                          <button type="button" onClick={() => eliminarAd(ad._id, 'portada')} style={{ ...s.btnSmall, background: '#FEF2F2', color: '#DC2626', borderColor: '#FECACA' }}>
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const s = {
  card: {
    background: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: '22px',
    padding: 'clamp(16px, 3.5vw, 24px)',
    boxShadow: '0 10px 30px -10px rgba(11,19,43,0.06)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
    gap: '18px',
  },
  title: { margin: 0, fontSize: '16px', fontWeight: 800, color: '#0B132B' },
  row: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  field: { display: 'flex', flexDirection: 'column', gap: '4px', flex: '1 1 160px', minWidth: 0 },
  label: { fontSize: '11px', fontWeight: 800, color: '#334155' },
  input: {
    padding: '10px 12px',
    borderRadius: '12px',
    border: '1px solid #CBD5E1',
    fontSize: '13px',
    fontWeight: 600,
    color: '#0B132B',
    background: '#F8FAFC',
    width: '100%',
    boxSizing: 'border-box',
    outline: 'none',
  },
  btnPrimary: {
    padding: '13px 16px',
    background: '#0B132B',
    color: '#06D6A0',
    border: 'none',
    borderRadius: '14px',
    fontWeight: 800,
    fontSize: '13px',
    cursor: 'pointer',
  },
  btnSecondary: {
    padding: '13px 16px',
    background: '#64748B',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '14px',
    fontWeight: 800,
    fontSize: '13px',
    cursor: 'pointer',
  },
  btnSmall: {
    padding: '6px 11px',
    borderRadius: '10px',
    border: '1px solid #CBD5E1',
    background: '#FFFFFF',
    color: '#0B132B',
    fontSize: '11px',
    fontWeight: 800,
    cursor: 'pointer',
  },
};