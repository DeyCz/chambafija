"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged, signOut } from 'firebase/auth';
import AdminDashboard from '../../components/AdminDashboard';

const firebaseConfig = {
  apiKey: "AIzaSyBunZ6pXtdgxqhWh5Qw3B-AJ7K93ey1Lqk",
  authDomain: "chambafija.firebaseapp.com",
  projectId: "chambafija",
  storageBucket: "chambafija.firebasestorage.app",
  messagingSenderId: "890727581404",
  appId: "1:890727581404:web:597f8c8f6b2daaaef45619",
  measurementId: "G-BFJ0RJFN9N"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

export default function AdminPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Correo o contraseña incorrectos.');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
  };

  if (loading) {
    return <div style={styles.loader}>Cargando ChambaFija...</div>;
  }

  if (!user) {
    return (
      <div style={styles.loginContainer}>
        <div style={styles.loginCard}>
          <div style={styles.loginHeader}>
            <h1 className="text-2xl font-black tracking-tight flex items-center gap-2 justify-center mb-1">
              <span className="text-slate-900">Chamba</span>
              <span className="text-[#06D6A0]">Fija</span>
            </h1>
            <p style={styles.loginSubtitle}>Panel de Control Administrativo</p>
          </div>
          
          <form onSubmit={handleLogin} style={styles.form}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Correo Electrónico</label>
              <input 
                type="email" 
                placeholder="admin@chambafija.com" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                style={styles.input}
                required
              />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Contraseña</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                style={styles.input}
                required
              />
            </div>
            
            {error && <div style={styles.errorBox}>{error}</div>}
            
            <button 
              type="submit" 
              className="w-full py-3.5 bg-[#06D6A0] hover:bg-emerald-500 text-slate-950 font-black rounded-xl transition-all shadow-md shadow-emerald-600/20"
            >
              Ingresar al Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={styles.topBar}>
        <div style={styles.brandMini}>
          Chamba<span style={styles.accentText}>Fija</span> <span style={{fontSize: '12px', color: '#94A3B8'}}>Admin</span>
        </div>
        <div style={styles.userSection}>
          <span style={styles.userEmail}>{user.email}</span>
          <button onClick={handleLogout} style={styles.btnLogout}>Cerrar Sesión</button>
        </div>
      </div>
      <AdminDashboard />
    </div>
  );
}

const styles = {
  loader: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'system-ui', color: '#0F172A', fontWeight: 'bold', fontSize: '16px' },
  loginContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', backgroundColor: '#0B132B', fontFamily: 'system-ui, sans-serif', padding: '16px' },
  loginCard: { backgroundColor: '#FFFFFF', padding: '40px 32px', borderRadius: '16px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)', width: '100%', maxWidth: '400px' },
  loginHeader: { textAlign: 'center', marginBottom: '28px' },
  accentText: { color: '#06D6A0' },
  loginSubtitle: { fontSize: '14px', color: '#475569', marginTop: '6px', fontWeight: '600' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '700', color: '#1E293B', textTransform: 'uppercase', letterSpacing: '0.5px' },
  input: { padding: '12px 14px', borderRadius: '8px', border: '1px solid #94A3B8', fontSize: '15px', color: '#0F172A', backgroundColor: '#F8FAFC', outline: 'none', boxSizing: 'border-box' },
  errorBox: { backgroundColor: '#FEF2F2', border: '1px solid #FCA5A5', color: '#991B1B', padding: '10px', borderRadius: '6px', fontSize: '13px', textAlign: 'center', fontWeight: '600' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#0B132B', padding: '12px 24px', color: '#FFFFFF', borderBottom: '1px solid #1E293B' },
  brandMini: { fontWeight: '900', fontSize: '18px', color: '#FFFFFF' },
  userSection: { display: 'flex', alignItems: 'center', gap: '16px' },
  userEmail: { fontSize: '13px', color: '#E2E8F0', fontWeight: '500' },
  btnLogout: { backgroundColor: 'transparent', color: '#F87171', border: '1px solid #F87171', padding: '6px 12px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }
};