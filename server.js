const express = require('express');
const cors = require('cors');

// 1. Nuevas importaciones modulares de Firebase Admin (Versión 12+)
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// 2. Cargar tu archivo local de credenciales
const serviceAccount = require('./firebase-key.json');

// 3. Inicializar Firebase con el nuevo formato
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const jobsRef = db.collection('jobs');

const app = express();
app.use(cors());
app.use(express.json());

console.log('🟢 [Database] Conectado exitosamente a Firebase Firestore');



// ==========================================
// RUTAS API PARA GESTIÓN DE EMPLEOS (FIREBASE)
// ==========================================

// OBTENER EMPLEOS (Con filtro)
app.get('/api/jobs', async (req, res) => {
    try {
        const { tipo } = req.query;
        let query = jobsRef;
        
        if (tipo && tipo !== 'Todos') {
            query = query.where('tipo', '==', tipo);
        }

        const snapshot = await query.get();
        const empleos = [];
        
        snapshot.forEach(doc => {
            empleos.push({ _id: doc.id, ...doc.data() });
        });

        // Ordenar VIPs primero en memoria
        empleos.sort((a, b) => (b.esVip === a.esVip) ? 0 : b.esVip ? 1 : -1);

        res.json({ success: true, count: empleos.length, data: empleos });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// CREAR EMPLEO
app.post('/api/jobs', async (req, res) => {
    try {
        const nuevoEmpleo = { ...req.body, fechaCreacion: new Date().toISOString() };
        const docRef = await jobsRef.add(nuevoEmpleo);
        res.status(201).json({ success: true, data: { _id: docRef.id, ...nuevoEmpleo } });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// EDITAR EMPLEO
app.put('/api/jobs/:id', async (req, res) => {
    try {
        await jobsRef.doc(req.params.id).update(req.body);
        res.json({ success: true, mensaje: 'Empleo actualizado' });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// ELIMINAR EMPLEO
app.delete('/api/jobs/:id', async (req, res) => {
    try {
        await jobsRef.doc(req.params.id).delete();
        res.json({ success: true, mensaje: 'Empleo eliminado' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Servidor backend corriendo en el puerto ${PORT}`);
});