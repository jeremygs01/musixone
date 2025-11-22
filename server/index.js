require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { createClient } = require('@supabase/supabase-js')

const app = express()
app.use(cors())
app.use(express.json())

// Cliente de Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Multer con memoria (necesario para Supabase Storage)
const upload = multer({ storage: multer.memoryStorage() })

/* =====================================================
   GET /api/tracks - Obtener canciones desde Supabase
=====================================================*/
app.get('/api/tracks', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tracks")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50)

    if (error) throw error

    res.json({ ok: true, tracks: data })
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: 'tracks_error' })
  }
})

/* =====================================================
   POST /api/upload - Subir música SIN token (modo beta)
=====================================================*/
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    if (!file) return res.status(400).json({ ok: false, error: 'no_file' })

    const title = req.body.title
    const artist = req.body.artist
    const genre = req.body.genre || 'Pop'

    // Nombre en Supabase
    const filename = `tracks/${Date.now()}_${file.originalname}`

    // Subir a Supabase Storage
    const { error: storageError } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        cacheControl: "3600"
      })

    if (storageError) throw storageError

    // URL pública
    const publicUrl =
      `${process.env.SUPABASE_URL}/storage/v1/object/public/${process.env.SUPABASE_BUCKET}/${filename}`

    // Guardar en la tabla
    const { data, error } = await supabase
      .from("tracks")
      .insert([
        {
          title,
          artist,
          genre,
          storage_path: publicUrl,
          plays: 0
        }
      ])
      .select()

    if (error) throw error

    res.json({ ok: true, track: data[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: 'upload_failed' })
  }
})

/* =====================================================
   Servidor
=====================================================*/
const PORT = process.env.PORT || 10000
app.listen(PORT, () => console.log("MusixOne backend running on", PORT))
