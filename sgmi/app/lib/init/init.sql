-- Simplified initialization script for SGMI (only required tables)
-- Covers: Usuarios (login/roles), Grupos, Memoria anual, Investigaciones, Trabajos en Congresos

CREATE ROLE IF NOT EXISTS "sgmi_user" LOGIN PASSWORD 'sgmi_password_3337';

-- Usuarios: login y roles (admin / user)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin','user')),
    estado BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Facultades (opcional, útil para agrupar grupos)
CREATE TABLE IF NOT EXISTS facultades (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);

-- Grupos de investigación
CREATE TABLE IF NOT EXISTS grupos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    facultad_id INTEGER REFERENCES facultades(id) ON DELETE SET NULL,
    estado BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Memoria anual para un grupo (una por año)
CREATE TABLE IF NOT EXISTS memorias (
    id SERIAL PRIMARY KEY,
    grupo_id INTEGER NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    anio INTEGER NOT NULL,
    contenido TEXT,
    creado_por INTEGER REFERENCES usuarios(id) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (grupo_id, anio)
);

-- Personal (investigadores / expositores)
CREATE TABLE IF NOT EXISTS personal (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    afiliacion VARCHAR(255),
    email VARCHAR(255)
);

-- Investigaciones (proyectos)
CREATE TABLE IF NOT EXISTS investigaciones (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    codigo VARCHAR(50),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    fuente_financiamiento TEXT,
    grupo_id INTEGER NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Participación N:N entre investigaciones y personal
CREATE TABLE IF NOT EXISTS investigacion_participantes (
    investigacion_id INTEGER NOT NULL REFERENCES investigaciones(id) ON DELETE CASCADE,
    personal_id INTEGER NOT NULL REFERENCES personal(id) ON DELETE CASCADE,
    rol VARCHAR(100),
    PRIMARY KEY (investigacion_id, personal_id)
);

-- Reuniones / congresos
CREATE TABLE IF NOT EXISTS reuniones (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) CHECK (tipo IN ('NACIONAL','INTERNACIONAL')),
    nombre VARCHAR(255) NOT NULL,
    ciudad VARCHAR(255),
    fecha_inicio DATE,
    fecha_fin DATE
);

-- Trabajos presentados en congresos
CREATE TABLE IF NOT EXISTS trabajos_congresos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    resumen TEXT,
    expositor_id INTEGER REFERENCES personal(id) ON DELETE SET NULL,
    reunion_id INTEGER REFERENCES reuniones(id) ON DELETE SET NULL,
    grupo_id INTEGER REFERENCES grupos(id) ON DELETE CASCADE,
    fecha_presentacion DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_grupos_facultad_id ON grupos(facultad_id);
CREATE INDEX IF NOT EXISTS idx_investigaciones_grupo_id ON investigaciones(grupo_id);
CREATE INDEX IF NOT EXISTS idx_memorias_grupo_anio ON memorias(grupo_id, anio);
CREATE INDEX IF NOT EXISTS idx_trabajos_grupo_id ON trabajos_congresos(grupo_id);

-- Notes: ON DELETE CASCADE is used where deleting a grupo should remove memos, investigaciones y trabajos.
-- Deleting a user does not delete content; creado_por in memorias is SET NULL to preserve historical data.

