const request = require('supertest');
const express = require('express');
const promotersRouter = require('../routes/promoters');

// Mock do supabase (base de dados)
jest.mock('../lib/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockImplementation((col, val) => {
      // Simulamos que a base de dados não encontra nenhum promotor para 'CODIGO_FALSO'
      if (val === 'CODIGO_FALSO') {
        return {
          single: jest.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } })
        };
      }
      // Se fosse um código válido
      return {
        single: jest.fn().mockResolvedValue({ 
          data: { id: 'uuid-123', user_id: 'user-123', commission_rate: 10 }, 
          error: null 
        })
      };
    })
  }
}));

// Mock dos middlewares de autenticação
jest.mock('../middleware/auth', () => ({
  verifyToken: (req, res, next) => {
    req.user = { id: 'fake-user-id' };
    next();
  },
  requireRole: () => (req, res, next) => next()
}));

const app = express();
app.use(express.json());
app.use('/api/promoters', promotersRouter);

describe('Promoters API - Verify Promocode', () => {
  it('Deve retornar erro 404 se o promocode for inválido', async () => {
    const res = await request(app).get('/api/promoters/verify/CODIGO_FALSO');
    
    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty('message', 'Código promocional inválido.');
  });

  it('Deve retornar 200 e um desconto fixo se o promocode for válido', async () => {
    const res = await request(app).get('/api/promoters/verify/RODRIGO20');
    
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('valid', true);
    expect(res.body).toHaveProperty('discount_percentage', 10);
  });
});
