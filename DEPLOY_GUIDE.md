# 🚀 Guía de Despliegue - Ahorcado Multiplayer

Esta guía te ayudará a desplegar el juego de Ahorcado Multiplayer en **Vercel** (frontend) y **Supabase** (backend/base de datos).

---

## 📋 Requisitos Previos

- Cuenta en [Vercel](https://vercel.com) (gratis)
- Cuenta en [Supabase](https://supabase.com) (gratis)
- [Node.js](https://nodejs.org) 18+ instalado
- [Git](https://git-scm.com) instalado
- CLI de Supabase (opcional, para edge functions)

---

## 🗃️ Paso 1: Configurar Supabase

### 1.1 Crear un nuevo proyecto en Supabase

1. Ve a [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click en **"New Project"**
3. Elige un nombre (ej: `ahorcado-game`)
4. Establece una contraseña para la base de datos
5. Selecciona la región más cercana a tus usuarios
6. Click en **"Create new project"**

### 1.2 Crear la tabla en la base de datos

1. En el panel de Supabase, ve a **SQL Editor**
2. Copia y pega el contenido del archivo `supabase/setup.sql`
3. Click en **"Run"** para ejecutar el script

```sql
-- Este script creará la tabla kv_store_e9cd80f1 necesaria para el juego
```

### 1.3 Obtener las credenciales

1. Ve a **Settings** → **API**
2. Copia estos valores:
   - **Project URL**: `https://TU_PROJECT_ID.supabase.co`
   - **Project ID**: El ID que aparece en la URL (ej: `abcdefghij`)
   - **anon/public key**: La clave pública

### 1.4 Desplegar la Edge Function

**Opción A: Usando Supabase CLI (recomendado)**

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Enlazar con tu proyecto
supabase link --project-ref TU_PROJECT_ID

# Desplegar la función
supabase functions deploy make-server-e9cd80f1 --no-verify-jwt
```

**Opción B: Desde el Dashboard**

1. Ve a **Edge Functions** en el panel de Supabase
2. Click en **"Create a new function"**
3. Nombra la función: `make-server-e9cd80f1`
4. Copia el contenido de `supabase/functions/make-server-e9cd80f1/index.ts`
5. Click en **"Deploy"**

---

## 🌐 Paso 2: Desplegar en Vercel

### 2.1 Subir el código a GitHub

```bash
# Inicializar git (si no está inicializado)
git init

# Agregar todos los archivos
git add .

# Hacer commit
git commit -m "Initial commit - Ahorcado Multiplayer"

# Crear repositorio en GitHub y subir
# (reemplaza con tu URL de GitHub)
git remote add origin https://github.com/TU_USUARIO/ahorcado.git
git branch -M main
git push -u origin main
```

### 2.2 Conectar con Vercel

1. Ve a [vercel.com/new](https://vercel.com/new)
2. Importa tu repositorio de GitHub
3. Vercel detectará automáticamente que es un proyecto Vite

### 2.3 Configurar Variables de Entorno

En la configuración del proyecto en Vercel:

1. Ve a **Settings** → **Environment Variables**
2. Agrega estas variables:

| Variable | Valor |
|----------|-------|
| `VITE_SUPABASE_PROJECT_ID` | Tu Project ID de Supabase |
| `VITE_SUPABASE_ANON_KEY` | Tu anon/public key de Supabase |

3. Click en **"Save"**

### 2.4 Desplegar

1. Ve a **Deployments**
2. Click en **"Redeploy"** para que tome las nuevas variables
3. ¡Tu app estará lista en minutos!

---

## ✅ Paso 3: Verificar el Despliegue

### 3.1 Probar la Edge Function

Abre tu navegador y visita:
```
https://TU_PROJECT_ID.supabase.co/functions/v1/make-server-e9cd80f1/health
```

Deberías ver:
```json
{"status":"ok","timestamp":"..."}
```

### 3.2 Probar la App

1. Abre tu URL de Vercel (ej: `https://ahorcado.vercel.app`)
2. Ve al **Panel de Admin**
3. Click en **"Cargar Palabras Iniciales"**
4. Crea un nuevo juego
5. ¡Comparte el código con tus amigos!

---

## 🔧 Solución de Problemas

### Error: "No words available"
- Asegúrate de cargar las palabras iniciales desde el panel de admin

### Error: "Game not found"
- Verifica que el código del juego sea correcto (6 caracteres)

### Error de CORS
- Verifica que la Edge Function tenga CORS habilitado
- El código ya incluye `cors()` middleware

### La app no carga
- Verifica las variables de entorno en Vercel
- Revisa la consola del navegador para errores

---

## 📁 Estructura del Proyecto

```
ahorcado/
├── src/
│   └── main.tsx          # Punto de entrada
├── components/
│   ├── admin/            # Panel de administración
│   ├── game/             # Componentes del juego
│   └── ui/               # Componentes UI reutilizables
├── styles/
│   └── globals.css       # Estilos globales + Tailwind
├── supabase/
│   ├── setup.sql         # Script SQL para crear tablas
│   └── functions/
│       └── make-server-e9cd80f1/
│           └── index.ts  # Edge Function
├── utils/
│   ├── initialWords.ts   # Palabras predefinidas
│   └── supabase/
│       └── info.tsx      # Configuración de Supabase
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🎮 Cómo Usar el Juego

### Para el Anfitrión/Profesor:
1. Abre el **Panel de Admin**
2. Carga palabras (si es la primera vez)
3. Crea un nuevo juego → obtén el código
4. Comparte el código con los jugadores
5. Abre la **Pantalla Principal** en un proyector
6. Inicia el juego cuando todos estén listos

### Para los Jugadores:
1. Click en **"Unirse como Jugador"**
2. Ingresa tu nombre y el código del juego
3. Espera a que el admin inicie el juego
4. ¡Adivina las letras!

---

## 🆘 ¿Necesitas Ayuda?

Si tienes problemas con el despliegue:

1. Revisa los logs en Vercel (Deployments → View logs)
2. Revisa los logs de Edge Functions en Supabase
3. Verifica que todas las variables de entorno estén configuradas
4. Asegúrate de que la tabla `kv_store_e9cd80f1` existe en Supabase

---

¡Disfruta tu juego de Ahorcado Multiplayer! 🎉
