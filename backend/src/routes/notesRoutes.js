import express from 'express'
import { supabase } from '../config/supabaseClient.js'

const router = express.Router()

router.get('/:structureId', async (req, res) => {
  try {
    const { structureId } = req.params

    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('structure_id', structureId)
      .order('created_at', { ascending: false })

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(data)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const { structure_id, title, content, priority } = req.body

    const { data, error } = await supabase
      .from('notes')
      .insert([
        {
          structure_id,
          title,
          content,
          priority
        }
      ])
      .select()

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json(data[0])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params

    const { error } = await supabase
      .from('notes')
      .delete()
      .eq('id', id)

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router