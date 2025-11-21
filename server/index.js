require('dotenv').config()
const express = require('express')
const cors = require('cors')
const multer = require('multer')
const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')
const { Pool } = require('pg')
const stripeLib = require('stripe')

const app = express()
app.use(cors())
app.use(express.json())

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)
const stripe = stripeLib(process.env.STRIPE_SECRET_KEY)
const upload = multer({ storage: multer.memoryStorage() })

function authenticate(req, res, next) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: 'no_token' })
  const token = auth.split(' ')[1]
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET)
    req.user = payload
    next()
  } catch (err) {
    return res.status(401).json({ error: 'invalid_token' })
  }
}

app.get('/api/tracks', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, title, artist, genre, storage_path, plays, created_at FROM tracks ORDER BY created_at DESC LIMIT 50'
    )
    res.json({ ok: true, tracks: rows })
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false })
  }
})

app.post('/api/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    const userId = req.user.id
    const { rows } = await pool.query('SELECT COUNT(*)::int AS c FROM tracks WHERE user_id=$1', [userId])
    const count = rows[0].c

    const sub = await pool.query('SELECT status FROM subscriptions WHERE user_id=$1', [userId])
    const isPremium = sub.rows.length && sub.rows[0].status === 'active'

    if (!isPremium && count >= 5) return res.status(403).json({ ok: false, reason: 'free_limit' })

    const file = req.file
    if (!file) return res.status(400).json({ ok: false, error: 'no_file' })

    const filename = `tracks/${userId}/${Date.now()}_${file.originalname}`
    const { error } = await supabase.storage
      .from(process.env.SUPABASE_BUCKET)
      .upload(filename, file.buffer, { contentType: file.mimetype })

    if (error) return res.status(500).json({ ok: false, error: 'storage_error' })

    const publicUrl =
      `${process.env.SUPABASE_URL}/storage/v1/object/public/` +
      `${process.env.SUPABASE_BUCKET}/${encodeURIComponent(filename)}`

    const insert = await pool.query(
      `INSERT INTO tracks(user_id, title, artist, genre, language, storage_path, duration)
       VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [userId, req.body.title, req.body.artist, req.body.genre, 'es', publicUrl, 0]
    )

    res.json({ ok: true, track: insert.rows[0] })
  } catch (err) {
    console.error(err)
    res.status(500).json({ ok: false, error: 'upload_failed' })
  }
})

app.post('/api/auth/login', async (req, res) => {
  const { email, name } = req.body
  if (!email) return res.status(400).json({ ok: false, error: 'no_email' })

  let user = await pool.query('SELECT * FROM users WHERE email=$1', [email])

  if (user.rows.length === 0) {
    const r = await pool.query(
      'INSERT INTO users(email, name) VALUES($1,$2) RETURNING *',
      [email, name || '']
    )
    user = r
  }

  const token = jwt.sign(
    { id: user.rows[0].id, email: user.rows[0].email },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  )

  res.json({ ok: true, token })
})

const PORT = process.env.PORT || 10000
app.listen(PORT, () => console.log('MusixOne backend listening on', PORT))
