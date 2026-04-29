# 🎵 The Fourth Lobby

Plataforma de bilhética e gestão para eventos de música eletrónica (HardTechno), desenvolvida em React, TypeScript e Supabase.

## 🚀 Tecnologias

- **Frontend:** React 18, Vite, TypeScript
- **State Management:** Zustand
- **Routing:** React Router v6
- **Backend/Database:** Supabase (PostgreSQL, Auth)
- **Styling:** CSS puro (Design System customizado com Glassmorphism)
- **Features:** qrcode.react (QR Codes)

## 📦 Como iniciar (Desenvolvimento)

1. **Instalar dependências:**
```bash
npm install
```

2. **Configurar variáveis de ambiente:**
Crie um ficheiro `.env` na raiz do projeto e adicione as chaves do Supabase:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

3. **Iniciar o servidor de desenvolvimento:**
```bash
npm run dev
```

4. **Aceder à aplicação:**
O Vite abrirá a app na porta 5173 (ou similar). Geralmente: `http://localhost:5173`

## 📂 Estrutura do Projeto

- `/src/components`: Componentes React reutilizáveis
- `/src/pages`: Páginas da aplicação (HomePage, Login, Dashboard, etc.)
- `/src/services`: Integrações externas (Supabase, Auth)
- `/src/store`: Gestão de estado global com Zustand
- `/src/types`: Definições de tipos TypeScript
- `/src/App.css`: Design System completo (variáveis CSS e estilos globais)

## 🔑 Tipos de Utilizador

O sistema suporta três papéis (roles) definidos na base de dados (e protegidos via RLS no Supabase):
- **Customer:** Pode ver eventos e comprar bilhetes
- **Promoter:** Pode visualizar métricas de eventos específicos
- **Organizer:** Pode gerir e visualizar estatísticas globais da plataforma

## 📜 Histórico

O projeto iniciou como um protótipo estático em HTML/CSS/JS com servidor Python e evoluiu para uma Single Page Application moderna utilizando o ecossistema React e backend as a service com o Supabase. O código do protótipo antigo está arquivado na pasta `_old_prototype/` caso seja necessária alguma referência visual antiga.
