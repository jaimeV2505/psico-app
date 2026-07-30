# PsicoApp 🧠

Sistema de gestión clínica para psicólogos. Multi-profesional, con historia clínica, sesiones, agenda e impresión de historias.

## Stack
- **Next.js 14** (App Router) + TypeScript
- **Supabase** (PostgreSQL + Auth + RLS)
- **Tailwind CSS**
- **Vercel** (deploy)

---

## 🚀 Setup paso a paso

### 1. Crear proyecto en Supabase
1. Ir a [supabase.com](https://supabase.com) y crear una cuenta
2. Click en **New Project**, elegir nombre y contraseña para la DB
3. Una vez creado, ir a **Settings → API** y copiar:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 2. Ejecutar el esquema SQL
1. En Supabase, ir a **SQL Editor**
2. Copiar y pegar todo el contenido de `supabase/schema.sql`
3. Click en **Run** — esto crea todas las tablas, triggers y políticas de seguridad

### 3. Configurar variables de entorno

Copiar `.env.local.example` a `.env.local`:
```bash
cp .env.local.example .env.local
```

Llenar con tus datos de Supabase:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Instalar dependencias y correr en local
```bash
npm install
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000) → te redirige a `/auth/login`

### 5. Deploy en Vercel

#### Opción A — Vercel CLI:
```bash
npx vercel
```

#### Opción B — GitHub:
1. Subir el proyecto a GitHub
2. Ir a [vercel.com](https://vercel.com) → Import Project
3. Conectar el repositorio
4. En **Environment Variables**, agregar:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Deploy!

---

## 📋 Funcionalidades

### ✅ Autenticación
- Login / Registro / Recuperar contraseña
- Cada profesional solo ve sus propios datos (Row Level Security)

### ✅ Pacientes
- Listado con búsqueda por nombre, DNI, teléfono
- Filtros por estado (activo, alta, derivado, inactivo) y género
- Ficha completa: datos personales, contacto, emergencia, historia clínica
- Crear, editar, eliminar
- Historial de sesiones asociado

### ✅ Historia Clínica
- Motivo de consulta
- Diagnóstico CIE-11 y DSM-5
- Antecedentes personales y familiares
- Tratamientos previos, medicación, alergias
- Objetivos terapéuticos

### ✅ Sesiones
- Registro por paciente con numeración automática
- Estado emocional, contenido, avances, tareas
- Modalidad presencial/online

### ✅ Agenda
- Vista semanal con navegación
- Crear, editar, eliminar citas
- Cambiar estado directamente desde la vista
- Asociar citas a pacientes

### ✅ Impresión
- Historia clínica completa lista para imprimir o guardar como PDF
- Incluye todas las sesiones registradas
- Encabezado con datos del profesional

### ✅ Perfil
- Editar datos profesionales y matrícula
- Cambiar contraseña

---

## 🔒 Seguridad
- Row Level Security activado: cada profesional solo accede a sus datos
- Contraseñas manejadas por Supabase Auth
- Middleware de sesión en cada ruta protegida
