-- ============================================================
-- schema.sql — Diseño Lógico (1.2.3)
-- Sistema de Refugios y Adopciones de Animales en Bogotá
-- Este archivo es referencia. Las tablas se crean
-- automáticamente en db.js al iniciar el servidor.
-- ============================================================

-- Tabla: USUARIO
CREATE TABLE IF NOT EXISTS USUARIO (
  id_usuario       INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre           TEXT    NOT NULL,
  apellido         TEXT    NOT NULL,
  correo           TEXT    NOT NULL UNIQUE,
  contrasena_hash  TEXT,                          -- NULL si registro OAuth
  ubicacion        TEXT,
  fecha_registro   TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
  activo           INTEGER NOT NULL DEFAULT 1     -- 1=activo, 0=inactivo
);

-- Tabla: PROVEEDOR_SOCIAL
CREATE TABLE IF NOT EXISTS PROVEEDOR_SOCIAL (
  id_proveedor     INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre_proveedor TEXT    NOT NULL UNIQUE,       -- 'google', 'facebook'
  url_oauth        TEXT    NOT NULL,
  activo           INTEGER NOT NULL DEFAULT 1
);

-- Tabla: CUENTA_SOCIAL
CREATE TABLE IF NOT EXISTS CUENTA_SOCIAL (
  id_cuenta         INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario        INTEGER NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
  id_proveedor      INTEGER NOT NULL REFERENCES PROVEEDOR_SOCIAL(id_proveedor),
  token_social      TEXT    NOT NULL,
  correo_social     TEXT,
  fecha_vinculacion TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
);

-- Tabla: SESION
CREATE TABLE IF NOT EXISTS SESION (
  id_sesion        INTEGER PRIMARY KEY AUTOINCREMENT,
  id_usuario       INTEGER NOT NULL REFERENCES USUARIO(id_usuario) ON DELETE CASCADE,
  token_sesion     TEXT    NOT NULL UNIQUE,
  fecha_inicio     TEXT    NOT NULL DEFAULT (datetime('now','localtime')),
  fecha_expiracion TEXT    NOT NULL,
  ip_acceso        TEXT
);
