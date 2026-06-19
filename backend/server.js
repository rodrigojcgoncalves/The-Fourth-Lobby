require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const eventRoutes = require('./routes/events');
const ticketRoutes = require('./routes/tickets');
const expenseRoutes = require('./routes/expenses');
const artistRoutes = require('./routes/artists');
const orderRoutes = require('./routes/orders');
const organizerRoutes = require('./routes/organizer');
const promotersRoutes = require('./routes/promoters');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/artists', artistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/organizer', organizerRoutes);
app.use('/api/promoters', promotersRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running!' });
});

// ── Global Error Handler ─────────────────────────────────────────────────────
// Garante que TODOS os erros (incluindo os do multer) retornam JSON e não HTML
app.use((err, req, res, next) => {
  console.error('[Global Error]', err.message);

  // Erros do Multer (ficheiro demasiado grande, tipo inválido, etc.)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ message: 'Ficheiro demasiado grande. Máximo permitido: 10MB.' });
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ message: 'Campo de ficheiro inesperado.' });
  }

  // Erro genérico
  res.status(err.status || 500).json({
    message: err.message || 'Erro interno do servidor.'
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
