const express = require('express');
const multer = require('multer');
const { verifyToken, requireRole } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

const router = express.Router();

const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB para fotos de artistas
});

// GET /api/artists - Listar todos os artistas (para pesquisa)
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .order('name', { ascending: true });

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao carregar artistas.', error: err.message });
  }
});

// POST /api/artists/upload - Upload de foto do artista (apenas organizadores)
router.post('/upload', verifyToken, requireRole('organizer'), upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Nenhum ficheiro recebido.' });
  }

  try {
    const fileExt = req.file.originalname.split('.').pop();
    const fileName = `artists/${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    // Usar o bucket EVENT-IMAGES (nome exacto como criado no Supabase dashboard)
    const { error } = await supabase.storage
      .from('EVENT-IMAGES')
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false
      });

    if (error) throw error;

    const { data: publicUrlData } = supabase.storage
      .from('EVENT-IMAGES')
      .getPublicUrl(fileName);

    res.status(200).json({ 
      message: 'Upload concluído com sucesso.', 
      imageUrl: publicUrlData.publicUrl 
    });
  } catch (err) {
    console.error('Artist upload error:', err);
    res.status(500).json({ message: 'Erro ao fazer upload da foto.', error: err.message });
  }
});

// POST /api/artists - Criar novo artista (apenas organizadores)
router.post('/', verifyToken, requireRole('organizer'), async (req, res) => {
  const { name, genre, bio, image_url } = req.body;

  try {
    // Verificar se já existe um artista com o mesmo nome (case-insensitive)
    const { data: existingArtist } = await supabase
      .from('artists')
      .select('id, name')
      .ilike('name', name.trim())
      .single();

    if (existingArtist) {
      return res.status(400).json({ 
        message: `Já existe um artista com o nome "${existingArtist.name}".`,
        existing: existingArtist 
      });
    }

    const { data, error } = await supabase
      .from('artists')
      .insert([{ name: name.trim(), genre, bio, image_url }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar artista.', error: err.message });
  }
});

module.exports = router;
