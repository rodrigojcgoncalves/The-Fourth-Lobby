const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { verifyToken } = require('../middleware/auth');
const { supabase } = require('../lib/supabase');

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password, fullName } = req.body;
  const role = 'customer'; // Role é SEMPRE 'customer' no registo público. Nunca confiar no cliente.

  try {
    // 0. Validação de segurança da password
    if (!password || password.length < 8) {
      return res.status(400).json({ message: 'A password deve ter no mínimo 8 caracteres.' });
    }
    if (!/[A-Z]/.test(password)) {
      return res.status(400).json({ message: 'A password deve conter pelo menos uma letra maiúscula.' });
    }
    if (!/[0-9]/.test(password)) {
      return res.status(400).json({ message: 'A password deve conter pelo menos um número.' });
    }

    // 1. Check if user already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(400).json({ message: 'Email já está em uso.' });
    }

    // 2. Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 3. Generate a UUID for the new user
    const id = crypto.randomUUID();

    // 4. Save to database
    // The 'users' table has columns: id, email, password_hash, role, full_name
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([
        { id, email, password_hash: passwordHash, role, full_name: fullName || null }
      ])
      .select()
      .single();

    if (error) throw error;

    // 5. Generate JWT token
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, fullName: newUser.full_name || fullName || null },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(201).json({
      message: 'Registo bem sucedido!',
      token,
      user: { id: newUser.id, email: newUser.email, role: newUser.role, fullName: newUser.full_name || fullName || null }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor.', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error || !user) {
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    // 2. Check if password is correct
    if (!user.password_hash) {
      return res.status(400).json({ message: 'Utilizador não tem password configurada (possível erro de migração).' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenciais inválidas.' });
    }

    // 3. Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, fullName: user.full_name || null },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      message: 'Login bem sucedido!',
      token,
      user: { id: user.id, email: user.email, role: user.role, fullName: user.full_name || null }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Erro no servidor.', error: err.message });
  }
});

// GET /api/auth/me - Rota Protegida que retorna os dados do utilizador
router.get('/me', verifyToken, async (req, res) => {
  try {
    // Buscar dados atualizados da BD (o JWT pode não ter fullName de tokens antigos)
    const { data: user, error } = await supabase
      .from('users')
      .select('id, email, role, full_name')
      .eq('id', req.user.id)
      .single();

    if (error || !user) {
      return res.status(404).json({ message: 'Utilizador não encontrado.' });
    }

    res.json({ 
      message: 'Acesso autorizado.',
      user: { id: user.id, email: user.email, role: user.role, fullName: user.full_name || null }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao obter dados do utilizador.', error: err.message });
  }
});

module.exports = router;
