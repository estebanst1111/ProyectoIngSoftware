require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const { iniciarDB } = require('./db');

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: ['http://localhost:5500','http://127.0.0.1:5500','http://localhost:3000','http://127.0.0.1:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../Frontend')));

app.use('/api', require('./routes/auth'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

app.use((req, res) => {
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Ruta no encontrada.' });
  res.sendFile(path.join(__dirname, '../Frontend/index.html'));
});

// Iniciar BD primero, luego el servidor
iniciarDB().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🐾 RefugiosBogotá corriendo en http://localhost:${PORT}`);
    console.log(`   Ambiente: ${process.env.NODE_ENV || 'development'}`);
    console.log(`   API:      http://localhost:${PORT}/api/registro`);
    console.log(`   Usuarios: http://localhost:${PORT}/api/usuarios\n`);
  });
}).catch(err => {
  console.error('[ERROR] No se pudo iniciar la base de datos:', err);
});
