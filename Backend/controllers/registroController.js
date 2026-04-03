const bcrypt = require('bcryptjs');
const { getAsync, allAsync, runAsync } = require('../db');
require('dotenv').config();

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 10;

function generarToken() {
  return require('crypto').randomBytes(48).toString('hex');
}
function fechaExpiracion() {
  const d = new Date(); d.setDate(d.getDate() + 7); return d.toISOString();
}

async function verificarDatos(datos) {
  const errores = {};
  if (!datos.nombre   || datos.nombre.trim().length   < 2) errores.nombre   = 'Mínimo 2 caracteres.';
  if (!datos.apellido || datos.apellido.trim().length < 2) errores.apellido  = 'Mínimo 2 caracteres.';
  if (!datos.ubicacion || !datos.ubicacion.trim())         errores.ubicacion = 'Selecciona tu localidad.';
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!datos.correo || !re.test(datos.correo)) errores.correo = 'Correo electrónico inválido.';
  if (!datos.esSocial && (!datos.contrasena || datos.contrasena.length < 8))
    errores.contrasena = 'Mínimo 8 caracteres.';

  if (!errores.correo) {
    const existe = await getAsync(
      'SELECT id_usuario FROM USUARIO WHERE LOWER(correo) = LOWER(?)', [datos.correo]
    );
    if (existe) errores.correo = 'Este correo ya está registrado. Usa otro o inicia sesión.';
  }
  return { valido: Object.keys(errores).length === 0, errores };
}

async function registroManual(req, res) {
  try {
    const datos = req.body;
    const { valido, errores } = await verificarDatos({ ...datos, esSocial: false });
    console.log('[Backend] Errores validación:', JSON.stringify(errores));
    if (!valido) return res.status(400).json({ exito: false, errores });

    const hash = await bcrypt.hash(datos.contrasena, BCRYPT_ROUNDS);
    const now  = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const { lastID } = await runAsync(
      `INSERT INTO USUARIO (nombre, apellido, correo, contrasena_hash, ubicacion, fecha_registro)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [datos.nombre.trim(), datos.apellido.trim(), datos.correo.toLowerCase().trim(), hash, datos.ubicacion.trim(), now]
    );

    const token = generarToken();
    await runAsync(
      `INSERT INTO SESION (id_usuario, token_sesion, fecha_expiracion, ip_acceso) VALUES (?, ?, ?, ?)`,
      [lastID, token, fechaExpiracion(), req.ip || null]
    );

    const usuario = await getAsync(
      'SELECT id_usuario, nombre, apellido, correo, ubicacion, fecha_registro FROM USUARIO WHERE id_usuario = ?',
      [lastID]
    );

    console.log('[Backend] Usuario creado:', usuario);
    return res.status(201).json({ exito: true, mensaje: 'Registro exitoso', token, usuario });

  } catch (err) {
    console.error('[registroManual]', err.message);
    if (err.message?.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ exito: false, errores: { correo: 'Este correo ya está registrado.' } });
    }
    return res.status(500).json({ exito: false, errores: { _global: 'Error interno. Intenta de nuevo.' } });
  }
}

async function registroSocial(req, res) {
  return res.status(503).json({ exito: false, errores: { _global: 'Integración social próximamente.' } });
}

async function listarUsuarios(req, res) {
  const usuarios = await allAsync(
    'SELECT id_usuario, nombre, apellido, correo, ubicacion, fecha_registro, activo FROM USUARIO'
  );
  return res.json({ total: usuarios.length, usuarios });
}

module.exports = { registroManual, registroSocial, listarUsuarios };
