/**
 * db.js — SQLite con sql.js (puro JavaScript, sin compilación)
 */

const initSqlJs = require('sql.js');
const path      = require('path');
const fs        = require('fs');
require('dotenv').config();

const DB_PATH = path.join(__dirname, process.env.DB_FILE || 'database.db');

let db;

async function iniciarDB() {
  const SQL = await initSqlJs();

  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS USUARIO (
      id_usuario INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL, apellido TEXT NOT NULL,
      correo TEXT NOT NULL UNIQUE, contrasena_hash TEXT,
      ubicacion TEXT,
      fecha_registro TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      activo INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS PROVEEDOR_SOCIAL (
      id_proveedor INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre_proveedor TEXT NOT NULL UNIQUE,
      url_oauth TEXT NOT NULL, activo INTEGER NOT NULL DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS CUENTA_SOCIAL (
      id_cuenta INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario INTEGER NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
      id_proveedor INTEGER NOT NULL REFERENCES PROVEEDOR_SOCIAL(id_proveedor),
      token_social TEXT NOT NULL, correo_social TEXT,
      fecha_vinculacion TEXT NOT NULL DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE IF NOT EXISTS SESION (
      id_sesion INTEGER PRIMARY KEY AUTOINCREMENT,
      id_usuario INTEGER NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
      token_sesion TEXT NOT NULL UNIQUE,
      fecha_inicio TEXT NOT NULL DEFAULT (datetime('now','localtime')),
      fecha_expiracion TEXT NOT NULL, ip_acceso TEXT
    );
  `);

  db.run(`INSERT OR IGNORE INTO PROVEEDOR_SOCIAL (nombre_proveedor, url_oauth)
    VALUES ('google', 'https://accounts.google.com/o/oauth2/auth')`);
  db.run(`INSERT OR IGNORE INTO PROVEEDOR_SOCIAL (nombre_proveedor, url_oauth)
    VALUES ('facebook', 'https://www.facebook.com/v18.0/dialog/oauth')`);

  guardarEnDisco();
  console.log(`[DB] Base de datos lista en: ${DB_PATH}`);
}

function guardarEnDisco() {
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

function getAsync(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    if (stmt.step()) {
      const row = stmt.getAsObject();
      stmt.free();
      return Promise.resolve(row);
    }
    stmt.free();
    return Promise.resolve(undefined);
  } catch(e) { return Promise.reject(e); }
}

function allAsync(sql, params = []) {
  try {
    const stmt = db.prepare(sql);
    const rows = [];
    stmt.bind(params);
    while (stmt.step()) rows.push(stmt.getAsObject());
    stmt.free();
    return Promise.resolve(rows);
  } catch(e) { return Promise.reject(e); }
}

function runAsync(sql, params = []) {
  try {
    db.run(sql, params);
    const res = db.exec('SELECT last_insert_rowid() as lastID');
    const lastID = res[0]?.values[0][0] || 0;
    guardarEnDisco();
    return Promise.resolve({ lastID });
  } catch(e) { return Promise.reject(e); }
}

module.exports = { iniciarDB, getAsync, allAsync, runAsync };
