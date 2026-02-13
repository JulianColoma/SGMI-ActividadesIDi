-- SGMI Database Initialization Script (Soft Delete Enabled)
-- Versión: Fresh Start (Volumen limpio)

-----------------------------------------------------------------
-- Create role (safe version)
-----------------------------------------------------------------
DO
$$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'sgmi_user') THEN
        CREATE ROLE sgmi_user LOGIN PASSWORD 'sgmi_password_3337';
    END IF;
END
$$;

-----------------------------------------------------------------
-- SCHEMA CREATION
-----------------------------------------------------------------

-- Usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin','user')),
    estado BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

-- Grupos de investigación
CREATE TABLE IF NOT EXISTS grupos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    deleted_at TIMESTAMP DEFAULT NULL
);

-- Memoria anual (Padre de la composición)
CREATE TABLE IF NOT EXISTS memorias (
    id SERIAL PRIMARY KEY,
    grupo_id INTEGER NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
    anio INTEGER NOT NULL,
    contenido TEXT,
    deleted_at TIMESTAMP DEFAULT NULL,
    UNIQUE (grupo_id, anio)
);

-- Personal
CREATE TABLE IF NOT EXISTS personal (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL,
    deleted_at TIMESTAMP DEFAULT NULL
);

-- Investigaciones (Hija de Memorias)
CREATE TABLE IF NOT EXISTS investigaciones (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    codigo VARCHAR(50),
    fecha_inicio DATE NOT NULL,
    fecha_fin DATE,
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    logros TEXT,
    fuente_financiamiento TEXT,
    dificultades TEXT,
    memoria_id INTEGER NOT NULL REFERENCES memorias(id) ON DELETE CASCADE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

-- Reuniones
CREATE TABLE IF NOT EXISTS reuniones (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) CHECK (tipo IN ('NACIONAL','INTERNACIONAL')),
    nombre VARCHAR(255) NOT NULL,
    ciudad VARCHAR(255),
    fecha_inicio DATE,
    fecha_fin DATE,
    pais VARCHAR(100),
    deleted_at TIMESTAMP DEFAULT NULL
);

-- Trabajos presentados (Hija de Memorias)
CREATE TABLE IF NOT EXISTS trabajos_congresos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    resumen TEXT,
    expositor_id INTEGER REFERENCES personal(id) ON DELETE SET NULL,
    reunion_id INTEGER REFERENCES reuniones(id) ON DELETE SET NULL,
    memoria_id INTEGER NOT NULL REFERENCES memorias(id) ON DELETE CASCADE,
    fecha_presentacion DATE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP DEFAULT NULL
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_investigaciones_memoria_id ON investigaciones(memoria_id);
CREATE INDEX IF NOT EXISTS idx_memorias_grupo_anio ON memorias(grupo_id, anio);
CREATE INDEX IF NOT EXISTS idx_trabajos_memoria_id ON trabajos_congresos(memoria_id);

-- Indexes opcionales para optimizar las consultas con Soft Delete
-- (Recomendado ya que siempre vas a filtrar por deleted_at IS NULL)
CREATE INDEX IF NOT EXISTS idx_usuarios_deleted_at ON usuarios(deleted_at);
CREATE INDEX IF NOT EXISTS idx_memorias_deleted_at ON memorias(deleted_at);
CREATE INDEX IF NOT EXISTS idx_investigaciones_deleted_at ON investigaciones(deleted_at);
CREATE INDEX IF NOT EXISTS idx_trabajos_deleted_at ON trabajos_congresos(deleted_at);

-- Evitar conflicto entre memorias vivas y eliminadas 
-- Borrar el constraint viejo
ALTER TABLE memorias DROP CONSTRAINT memorias_grupo_id_anio_key;

-- Crear indice que solo mira los activos
CREATE UNIQUE INDEX idx_memorias_grupo_anio_unique 
ON memorias (grupo_id, anio) 
WHERE deleted_at IS NULL;
-----------------------------------------------------------------
-- DATA SEED SECTION
-----------------------------------------------------------------

-- 1. LIMPIEZA PREVIA
TRUNCATE TABLE usuarios, grupos, personal, memorias, investigaciones, reuniones, trabajos_congresos RESTART IDENTITY CASCADE;

-- 2. INSERTAR USUARIOS
INSERT INTO usuarios (nombre, email, password, role) VALUES
('Administrador SGMI', 'admin@sgmi.local', 'admin123', 'admin'),
('María Gómez', 'maria@sgmi.local', 'user123', 'user'),
('Juan Pérez', 'juan@sgmi.local', 'user123', 'user');

-- 3. INSERTAR GRUPOS
INSERT INTO grupos (nombre) VALUES
('Grupo de Energías Renovables'),
('Grupo de Biotecnología Aplicada'),
('Grupo de Estudios Sociales y Culturales');

-- 4. INSERTAR PERSONAL
INSERT INTO personal (nombre) VALUES 
('Dr. Roberto Solar'), 
('Dra. Ana Bio');

-- 5. INSERTAR MEMORIAS
INSERT INTO memorias (grupo_id, anio, contenido)
VALUES
(1, 2024, 'Resumen de actividades y publicaciones del año 2024.'),
(2, 2024, 'Reporte anual de investigaciones en biotecnología.'),
(3, 2024, 'Informe de extensión cultural y social.');

-- 6. INSERTAR INVESTIGACIONES
INSERT INTO investigaciones (tipo, codigo, fecha_inicio, fecha_fin, nombre, descripcion, fuente_financiamiento, memoria_id)
VALUES
('Proyecto', 'ENR-2025-001', '2025-01-15', NULL, 'Desarrollo de paneles solares de alta eficiencia', 'Investigación aplicada sobre nuevos materiales.', 'Ministerio de Ciencia', 1),
('Proyecto', 'BIO-2025-002', '2025-03-10', NULL, 'Producción sostenible de enzimas industriales', 'Proyecto colaborativo con el sector privado.', 'Fondo Nacional de Innovación', 2);

-- 7. INSERTAR REUNIONES
INSERT INTO reuniones (tipo, nombre, ciudad, fecha_inicio, fecha_fin)
VALUES
('NACIONAL', 'Congreso Argentino de Energías Renovables', 'Buenos Aires', '2025-06-12', '2025-06-15'),
('INTERNACIONAL', 'Simposio Latinoamericano de Biotecnología', 'Montevideo', '2025-08-20', '2025-08-23');

-- 8. INSERTAR TRABAJOS PRESENTADOS
INSERT INTO trabajos_congresos (titulo, resumen, expositor_id, reunion_id, memoria_id, fecha_presentacion)
VALUES
('Optimización de paneles solares híbridos', 'Estudio comparativo entre materiales de nueva generación.', 1, 1, 1, '2025-06-13'),
('Avances en biocatálisis industrial', 'Resultados preliminares de enzimas aplicadas en síntesis química.', 2, 2, 2, '2025-08-21');