# The Fourth Lobby

Sistema B2B ("White-Label") de bilhética e gestão de eventos de música eletrónica, desenhado nativamente para ser a plataforma exclusiva da label **Fourth Dimension**. O sistema suporta o ciclo completo de um evento, desde a gestão de RPs/Promotores e a venda de bilhetes com descontos de afiliados, até ao check-in de participantes (QR Code) e controlo financeiro.

---

## Visão Geral da Arquitectura

O projeto segue uma arquitectura cliente-servidor com uma SPA em React no frontend e uma API REST em Node.js/Express no backend. Ambos comunicam com uma base de dados Supabase (PostgreSQL). A autenticação é feita via tokens JWT emitidos pelo backend, o que permite um controlo de acessos granular por role.

```
Frontend (React/Vite) → API REST (Node.js/Express) → Supabase (PostgreSQL)
```

---

## Stack Tecnológico

### Frontend

| Tecnologia            | Função                                   |
| --------------------- | ---------------------------------------- |
| React 18 + TypeScript | Framework de UI                          |
| Vite                  | Build tool e servidor de desenvolvimento |
| Vitest + RTL          | Testes Unitários e de Integração         |
| React Router v6       | Routing client-side                      |
| Zustand               | Gestão de estado global                  |
| qrcode.react          | Geração de QR Codes para bilhetes        |
| Lucide React          | Biblioteca de ícones                     |

### Backend

| Tecnologia        | Função                                  |
| ----------------- | --------------------------------------- |
| Node.js + Express | Servidor REST API                       |
| Jest + Supertest  | Testes Unitários e de Integração da API |
| Supabase JS SDK   | Cliente de base de dados (PostgreSQL)   |
| Supabase Storage  | Upload de imagens                       |
| JSON Web Tokens   | Autenticação                            |

---

## Primeiros Passos

### Pré-requisitos

- Node.js 18+
- Um projeto Supabase com as tabelas e buckets de storage configurados

### 1. Instalar dependências

```bash
# Frontend
npm install

# Backend
cd backend
npm install
```

### 2. Configurar variáveis de ambiente

**Frontend** — criar `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=url_do_teu_projeto_supabase
VITE_SUPABASE_ANON_KEY=chave_anon_supabase
```

**Backend** — criar `.env` dentro da pasta `/backend`:

```env
SUPABASE_URL=url_do_teu_projeto_supabase
SUPABASE_SERVICE_ROLE_KEY=chave_service_role_supabase
JWT_SECRET=segredo_jwt
PORT=5000
```

> O backend utiliza a service role key para contornar o RLS do Supabase onde necessário. Nunca a exponhas no frontend nem a commits ao repositório.

### 3. Iniciar os servidores de desenvolvimento

```bash
# Frontend (porta 5173)
npm run dev

# Backend (porta 5000)
cd backend
node server.js
```

### 4. Executar os Testes Unitários

O projeto utiliza um paradigma _Test Driven Development_ (TDD) para estabilidade a longo prazo.

```bash
# Testes do Backend (Jest)
cd backend
npm test
```

---

## Estrutura do Projeto

```
the-fourth-lobby/
├── backend/
│   ├── middleware/
│   │   └── auth.js            # Verificação JWT e controlo de roles
│   ├── routes/
│   │   ├── auth.js            # Login e registo
│   │   ├── events.js          # CRUD de eventos + upload de imagens
│   │   ├── artists.js         # Gestão de artistas
│   │   ├── tickets.js         # Compra e validação de bilhetes
│   │   ├── expenses.js        # Registo de despesas por evento
│   │   ├── orders.js          # Gestão de encomendas
│   │   └── organizer.js       # Estatísticas exclusivas do organizador
│   └── server.js
├── src/
│   ├── components/
│   │   └── layout/            # Header, OrganizerLayout (sidebar)
│   ├── pages/                 # Um ficheiro por rota/vista
│   ├── services/              # Camada de comunicação com a API
│   ├── store/                 # Estado global com Zustand (autenticação)
│   ├── types/                 # Interfaces TypeScript partilhadas
│   └── index.css              # Design system global (variáveis CSS)
└── public/
    └── img/                   # Assets estáticos da marca
```

---

## Roles de Utilizador

O controlo de acessos é aplicado no backend via middleware. São suportados três roles:

| Role        | Permissões                                                         |
| ----------- | ------------------------------------------------------------------ |
| `customer`  | Ver eventos, comprar bilhetes, consultar os seus próprios bilhetes |
| `promoter`  | Consultar métricas de vendas de eventos aos quais está associado   |
| `organizer` | Gestão completa de eventos, artistas, despesas e estatísticas      |

---

## Endpoints da API

| Método | Endpoint                        | Auth                | Descrição                                                                 |
| ------ | ------------------------------- | ------------------- | ------------------------------------------------------------------------- |
| POST   | `/api/auth/register`            | —                   | Criar conta                                                               |
| POST   | `/api/auth/login`               | —                   | Autenticar, receber JWT                                                   |
| GET    | `/api/events`                   | —                   | Listar eventos publicados                                                 |
| POST   | `/api/events`                   | Organizador         | Criar evento                                                              |
| POST   | `/api/events/:id/upload-image`  | Organizador         | Upload de capa do evento                                                  |
| GET    | `/api/tickets/my`               | Cliente             | Consultar bilhetes próprios                                               |
| POST   | `/api/tickets/purchase`         | Cliente             | Comprar bilhete                                                           |
| GET    | `/api/promoters/verify/:code`   | Cliente Autenticado | Verifica a validade de um código de desconto de RP                        |
| GET    | `/api/promoters/dashboard`      | Promotor            | Dashboard com métricas de vendas, comissões ganhas e eventos da sua label |
| GET    | `/api/expenses/event/:id`       | Organizador         | Listar despesas de um evento                                              |
| POST   | `/api/expenses/event/:id`       | Organizador         | Adicionar despesa                                                         |
| PATCH  | `/api/expenses/:id/toggle-paid` | Organizador         | Alternar estado pago/pendente                                             |
| DELETE | `/api/expenses/:id`             | Organizador         | Apagar despesa                                                            |

---

## Storage de Imagens

As imagens são guardadas no bucket `event-images` do Supabase, organizadas em subpastas:

- `event-images/events/` - capas dos eventos
- `event-images/artists/` - fotos de perfil dos artistas

---

## Notas

- Este projeto foi desenvolvido como Projeto Final de Curso para uma formação em desenvolvimento web.
- A aplicação evoluiu de um protótipo estático em HTML/CSS/JS com servidor Python para uma SPA moderna com o ecossistema React.
- Não existe atualmente nenhum ambiente de produção configurado. Todos os serviços correm localmente durante o desenvolvimento.
