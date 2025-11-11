# CRUD de Grupos - Estructura y Uso

## 📋 Arquitectura

El proyecto sigue el patrón **Route → Controller → Model → Database**:

```
Route (API Handler)
  ↓
Controller (Validación + Lógica de Negocio)
  ↓
Model (Operaciones de BD)
  ↓
Database (Pool de conexiones)
```

## 🗂️ Estructura de Archivos

```
app/
├── api/
│   └── grupo/
│       ├── route.ts           # GET /api/grupo, POST /api/grupo
│       └── [id]/
│           └── route.ts       # GET, PUT, DELETE por ID
├── lib/
│   ├── db.ts                  # Conexión a BD (con inyección de dependencias)
│   ├── controllers/
│   │   └── grupo.ts           # Controlador con validaciones
│   ├── models/
│   │   └── grupo.ts           # Modelo con operaciones de BD
│   └── init/
│       └── grupo_schema.sql   # Schema de la BD
```

## 🚀 Endpoints

### GET /api/grupo
Obtiene todos los grupos del usuario autenticado.

**Headers requeridos:**
```
x-user-id: <numero_usuario>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Mi Primer Grupo",
      "descripcion": "Descripción del grupo",
      "usuario_id": 1,
      "fecha_creacion": "2025-01-15T10:30:00Z",
      "estado": true
    }
  ],
  "message": "Se encontraron 1 grupos"
}
```

---

### POST /api/grupo
Crea un nuevo grupo.

**Headers requeridos:**
```
x-user-id: <numero_usuario>
```

**Body:**
```json
{
  "nombre": "Nuevo Grupo",
  "descripcion": "Descripción opcional"
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "data": {
    "id": 2,
    "nombre": "Nuevo Grupo",
    "descripcion": "Descripción opcional",
    "usuario_id": 1,
    "fecha_creacion": "2025-01-15T10:35:00Z",
    "estado": true
  },
  "message": "Grupo creado exitosamente"
}
```

---

### GET /api/grupo/[id]
Obtiene un grupo específico.

**Headers requeridos:**
```
x-user-id: <numero_usuario>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Mi Primer Grupo",
    "descripcion": "Descripción del grupo",
    "usuario_id": 1,
    "fecha_creacion": "2025-01-15T10:30:00Z",
    "estado": true
  }
}
```

**Respuesta error (403 - Sin permisos):**
```json
{
  "success": false,
  "error": "No tienes permisos para acceder a este grupo"
}
```

---

### PUT /api/grupo/[id]
Actualiza un grupo.

**Headers requeridos:**
```
x-user-id: <numero_usuario>
```

**Body (solo los campos a actualizar):**
```json
{
  "nombre": "Nombre actualizado",
  "descripcion": "Nueva descripción",
  "estado": false
}
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "nombre": "Nombre actualizado",
    "descripcion": "Nueva descripción",
    "usuario_id": 1,
    "fecha_creacion": "2025-01-15T10:30:00Z",
    "estado": false
  },
  "message": "Grupo actualizado exitosamente"
}
```

---

### DELETE /api/grupo/[id]
Elimina un grupo.

**Headers requeridos:**
```
x-user-id: <numero_usuario>
```

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "message": "Grupo eliminado exitosamente"
}
```

## 🔐 Autenticación

Actualmente los headers se leen de `x-user-id`, pero **deberías integrar un sistema de autenticación real** (JWT, NextAuth, etc.).

### TODO:
1. Reemplazar `request.headers.get('x-user-id')` con tu sistema de sesión
2. Implementar validación de tokens JWT
3. Crear middleware de autenticación

## 💾 Base de Datos

Ejecuta el script `grupo_schema.sql` para crear las tablas:

```sql
-- Ejecutar en tu BD PostgreSQL
\i app/lib/init/grupo_schema.sql
```

## 🧪 Ejemplo de uso con cURL

```bash
# Crear grupo
curl -X POST http://localhost:3000/api/grupo \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{"nombre":"Mi Grupo","descripcion":"Test"}'

# Obtener todos
curl http://localhost:3000/api/grupo \
  -H "x-user-id: 1"

# Obtener uno
curl http://localhost:3000/api/grupo/1 \
  -H "x-user-id: 1"

# Actualizar
curl -X PUT http://localhost:3000/api/grupo/1 \
  -H "Content-Type: application/json" \
  -H "x-user-id: 1" \
  -d '{"nombre":"Grupo Actualizado"}'

# Eliminar
curl -X DELETE http://localhost:3000/api/grupo/1 \
  -H "x-user-id: 1"
```

## 🔄 Inyección de Dependencias

El archivo `db.ts` está preparado para inyectar configuraciones personalizadas:

```typescript
// Uso por defecto (variables de entorno)
import db from '@/app/lib/db';

// Uso con configuración custom (testing)
import Database from '@/app/lib/db';
const dbTest = Database.getInstance({
  user: 'test',
  host: 'localhost',
  database: 'test_db',
  password: 'test',
  port: 5432
});
```

## 📝 Notas

- Todas las validaciones se hacen en el **Controlador**
- La lógica de BD está en el **Modelo**
- Los **Routes** solo coordinan las llamadas
- Los errores de permisos retornan **403**, los de validación **400**, los no encontrados **404**
