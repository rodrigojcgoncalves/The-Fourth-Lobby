const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido ou expirado.' });
  }
};

// Aceita uma role singular ou um array de roles (ex: requireRole(['organizer', 'promoter']))
const requireRole = (roles) => {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Autenticação necessária.' });
    }
    if (!allowed.includes(req.user.role)) {
      console.warn(`[RBAC] Acesso negado: ${req.user.email} (${req.user.role}) tentou aceder a rota restrita a [${allowed.join(', ')}]`);
      return res.status(403).json({ message: 'Acesso proibido. Permissões insuficientes.' });
    }
    next();
  };
};

module.exports = { verifyToken, requireRole };
