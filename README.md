# MusixOne (musixone-app)

**One world. One sound.**

Creado por jeremygs01

## Estructura
- `frontend/` - React + Vite frontend (deploy a Vercel)
- `server/` - Express backend (deploy a Render)
- `database/` - SQL scripts (create tables in Supabase)

## Rápido
1. Rellena `.env` en `server/` con las credenciales de Supabase y Stripe (ver `.env.example`).
2. Despliega backend en Render (root: `server/`).
3. Despliega frontend en Vercel (root: `frontend/`), añade `VITE_API_URL`.

## Autor
jeremygs01
