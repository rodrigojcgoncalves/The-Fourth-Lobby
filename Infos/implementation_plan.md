# Detailed Implementation Plan - The Fourth Lobby

Este plano detalha cada etapa técnica necessária para atingir os objetivos estruturados, servindo como guia de desenvolvimento para as próximas semanas.

---

## Fase 1: Segurança, RBAC e Dinamismo de Dados

**Objetivo:** Consolidar a base técnica e tornar o fluxo de compra/visualização funcional.

### 1.1 Segurança e Controlo de Acesso (RBAC)

- **Backend:**
  - Refinar o middleware `requireRole` para garantir que rotas de `/api/organizer/*` falham se o token não tiver `role: 'organizer'`.
- **Frontend:**
  - Atualizar `ProtectedRoute.tsx` para verificar a role na store do Zustand.
  - Implementar redirecionamento automático para `/unauthorized` ou `/login`.

### 1.2 Páginas de Utilizador (Checkout & My Tickets)

- **Checkout Page:**
  - Implementar formulário de resumo de compra.
  - Criar rota `POST /api/orders` que gera a `order` e os `order_items`.
- **My Tickets Page:**
  - Criar componente de listagem de bilhetes (Card com imagem do evento, data e status).
  - Fetch de `GET /api/tickets/my`.

### 1.3 Fixes de UI e Dados

- **EventDetailsPage:** Garantir que o campo `description` de cada `ticket_type` é renderizado (atualmente omitido).
- **Public Privacy:** Modificar a API para retornar apenas se o bilhete está "Disponível" ou "Esgotado", ocultando a `total_quantity` real do público.

---

## Fase 2: Módulo do Organizador (Gestão & Finanças)

**Objetivo:** Fornecer ferramentas de gestão de alto nível para os donos de labels.

### 2.1 Layout Administrativo

- **OrganizerShell:** Componente de layout com Sidebar persistente (Mobile-friendly).
- **Dashboard Principal:** Cards de resumo (Total vendas, Eventos ativos, Balanço financeiro).

### 2.2 Dashboard de Evento Detalhado

- Criar vista de tabs:
  - **Tab Editar:** Reaproveitar `EditEventPage.tsx`.
  - **Tab RPs:** Listagem de promotores associados ao evento.
  - **Tab Despesas:** CRUD de gastos (Aluguer de sala, Artistas, Marketing).
  - **Tab Check-in:** Botão para abrir o scanner de bilhetes.

### 2.3 Perfil Público da Label

- Criar rota `/label/:slug` (ex: `/label/fourth-dimension`).
- Layout Premium: Header com banner/logo -> Bio -> Grid de Eventos Futuros -> Secção de Histórico.

---

## Fase 3: Ecossistema de Promotores (RP)

**Objetivo:** Criar um canal de vendas descentralizado.

### 3.1 Onboarding e Convites

- **Database:** Criar tabela `promoter_invites` (event_id, user_email, status).
- **UI Organizador:** Input para pesquisar user por email e enviar convite.
- **UI User:** Dashboard "Sou Promotor" para ver convites pendentes e aceitar.

### 3.2 Lógica de Promocodes e Vendas

- **Backend:**
  - Middleware no Checkout para validar `referral_code`.
  - Atribuir comissão ao `promoter_id` no momento da criação do bilhete.
- **Stats:** Criar endpoint `GET /api/promoter/stats` para o RP ver o seu saldo e vendas.

---

## Fase 4: Operações (QR Codes & Check-in)

**Objetivo:** Resolver a entrada no evento físico.

### 4.1 Bilhetes com QR Code

- **Backend:** Utilizar a biblioteca `qrcode` para gerar uma string Base64 única guardada na tabela `tickets`.
- **Frontend:** Exibir o QR Code num modal dentro da página "My Tickets".

### 4.2 Ferramenta de Scanner

- Implementar componente `ScannerOverlay` usando `react-qr-reader`.
- **Endpoint:** `POST /api/tickets/scan` (Recebe o código QR, verifica validade e altera status para `used`).

---

## Fase 5: Inteligência (NLP) e Polimento Visual

**Objetivo:** Adicionar valor analítico e refinar a marca.

### 5.1 Análise de Sentimento (NLP)

- **Integração:** Usar a API da Hugging Face para analisar descrições ou feedbacks.
- **Visualização:** Mostrar um "Sentimento do Público" (ex: Positivo/Neutro) no dashboard de estatísticas do organizador.

### 5.2 Polimento de UI (Design System)

- **CSS Audit:** Uniformizar gradientes e o efeito _Blur_ do Glassmorphism.
- **Search Bar:** Reduzir a altura e arredondar bordas para um look mais "Apple-like".
- **Footer:** Atualizar textos de contacto no componente central.

---

## Plano de Verificação

### Testes Críticos

1. **Segurança:** Tentar aceder a `/organizer/dashboard` com uma conta de `customer` (deve bloquear).
2. **Checkout:** Verificar se após a compra o bilhete aparece instantaneamente em "My Tickets".
3. **Finanças:** Adicionar 3 despesas e verificar se o total de custos bate certo com a soma manual.
4. **RPs:** Usar um código de RP no checkout e verificar se a comissão foi registada na tabela `affiliate_conversions`.
