# 1. Adicionar isto a APP.JSX:

contexto: permitir o acesso a certas páginas apenas quem tem premissões para tal. Usado no auth.Service, authStore.js e ProtectedRoutes.jsx

No teu ficheiro de rotas, vais envolver as páginas sensíveis com este componente:

<Routes>
  <Route path="/login" element={<LoginPage />} />
  
  {/* Apenas organizadores podem entrar aqui */}
  <Route 
    path="/dashboard/*" 
    element={
      <ProtectedRoute allowedRoles={['organizer']}>
        <DashboardLayout />
      </ProtectedRoute>
    } 
  />
</Routes>

# 2. Coisas a implementar

IMPORTANTE: não esquecer da segurança de todas as rotas, para ninguém entrar onde não deve. Users não devem conseguir entrar em rotas de promotores e organizadores, e assim sucessivamente

CORRIGIR:

A descrição dos bilhetes não está a aparecer no evento
Página de Checkout ainda está estática
Página My Tickets ainda está estática
Media center funcional

## 2.1 Organizador

A página do organizador deve ter uma barra lateral para escolher as opções:
"Eventos" (Devem aparecer os eventos atuais e eventos passados), "Equipa de RP's" (onde pode criar uma equipa de RP's predefinida para todos os eventos deles), "Perfil" (Perfil da organização, para alterar informações da organização)
URL personalizado para a label (/label/nome-da-label)
O organizador deve ter uma página exclusiva para criar eventos (dentro),

Quero criar uma página de peril para a organização, onde devem estar listados os eventos atuais e os eventos passados
O perfil do organizador deve ter um banner, logo, nome da label, e os artistas que já tocaram ali

No organizer dashboard, cada evento deve deve ser clicável, ou seja, deve levar para uma página como "event-details" onde terá as opções Editar Evento, Estatísticas, Gestão de RP's, Gestão de Artistas e Gestão de Bilhetes, Despesas do evento e Scan de bilhetes

(Despesas do evento devem ser personalizáveis, adicionar uma despesa, nome, valor, pago ou não pago, quem pagou, total)

Ao estabelecer os RP's, devem ter a opção de escolher se têm comissão, se sim, a percentagem da comissão, ou o desconto que o promocode do RP vai dar no bilhete

O organizador deve ter também uma secção

### 2.1.1 Dentro do "Editar Evento" (Vista organizador)

A imagem de todos os eventos deve ser de dimenões iguais (16:9)
Definir se o eventos está publico ou privado
Definir se cada fase de bilhetes está publica ou privada

Quero deixar esta página mais dinâmica. Deve ter um menu lateral para escolher as opções:
"Informações e media", "Artistas", "Bilhetes", (adicionar) Gestão de RP's para cada evento

### 2.2 Estatísticas (NLP)

Um dos objetivos do trabalho é também implementar um sistema de análise de sentimentos com NLP, de forma a percebermos como é que o público está a reagir ao evento.
Não sei bem como fazer isto por enquanto mas é importante deixar um espaço para criação desta parte.
Deve fazer parte da secção de estatísticas do evento, talvez um sub-secção

## 2.2 Eventos

O número restante de bilhetes de cada fase não deve ser público (não deve aparecer na pagina do evento)
Cada evento deve gerar um código QR único, para ser lido na entrada do evento

## 2.3 No footer

(não é prioritário)
Atualizar informações do site (eu posso alterar isso manualmente, quero apenas que me indiques onde isso está)

## 2.4 Customer

Cada cliente deve poder ter uma foto de perfil, deve conseguir alterar os seus dados pessoais
No perfil não deve aparecer "Customer" como role, já que por norma a maioria dos users vão ser customers
Purchase History funcional

## 2.5 RP/Promotor

No header da página deve aparecer um botão sutil mais escuro escrito "Sou Promotor"
Ao clicar é redirecidonado para uma página onde deve aparecer convites para serem promotores de uma festa, com uma opção de aceitar ou recusar
cada RP deve ter o seu promocode único e personalizado pela organização
O promocode deve ser válido na compra do bilhete (por clientes normais), com o desconto (estabelecido pelo organizador)
O promotor deve ter acesso a estatísicas como quantos bilhetes vendeu, saldo (caso receba comissão)

## Geral

(não prioritário)
No geral quero melhorar o front-end para ficar algo mais uniforma e profissional, seguindo um esquema de cores consistente
Fazer a barra de pesquisa mais pequena (está muito quadrada, deve ser mais fina)

# 3. Objetivos Estruturados

Esta secção organiza as tuas metas de forma técnica para execução.

### 3.1 Segurança e Core Fixes

- [ ] **RBAC (Role-Based Access Control):** Bloquear rotas sensíveis de Organizador/Promoter para utilizadores sem permissão.
- [ ] **Páginas Dinâmicas:** Transformar Checkout e "My Tickets" em páginas funcionais (dados reais do DB).
- [ ] **Descrições de Bilhetes:** Garantir que a descrição personalizada aparece na página do evento.
- [ ] **Privacidade de Stock:** Ocultar o número exato de bilhetes restantes na vista de compra.

### 3.2 Módulo do Organizador (Label Management)

- [ ] **Sidebar Administrativa:** Acesso rápido a Eventos, Equipa de RPs e Perfil da Organização.
- [ ] **Página de Detalhes do Evento (Interna):**
  - Abas/Menu para: **Editar Evento**, **Estatísticas (NLP)**, **Gestão de RPs**, **Artistas**, **Bilhetes**, **Despesas** e **Check-in/Scan**.
- [ ] **Gestão Financeira (Despesas):** Sistema para adicionar despesas (nome, valor, estado de pagamento, responsável) com cálculo de balanço total.
- [ ] **Configuração de RPs:** Toggle de comissão (%), definição de descontos por promocode.
- [ ] **Perfil da Label (`/label/:slug`):** Banner, logo, bio e histórico público de eventos/artistas.
- [ ] **Validação Visual:** Imagens em 16:9 e controlos de visibilidade (Public/Private) por evento e fase.

### 3.3 Check-in e Bilhética

- [ ] **QR Code Unificado:** Gerar um código QR único por bilhete vendido.
- [ ] **Ferramenta de Scan:** Implementar a lógica de leitura na entrada do evento (marcar bilhete como "Usado" no DB).

### 3.4 Experiência do Promotor (RP)

- [ ] **Onboarding & Convites:** Botão "Sou Promotor" no Header e interface de Aceitar/Recusar convites de labels.
- [ ] **Sales Dashboard:** Promocode personalizado, estatísticas de vendas, cliques e saldo de comissões.

### 3.5 Experiência do Cliente (Customer)

- [ ] **Perfil Pessoal:** Upload de foto e edição de dados (esconder a role "Customer").
- [ ] **Purchase History:** Histórico completo de encomendas e bilhetes ativos.

### 3.6 Interface Global

- [ ] **Uniformização:** Aplicar o esquema de cores e Glassmorphism de forma profissional em todo o site.
- [ ] **Search Bar:** Ajustar para um formato mais fino e elegante.

## 4. Sugestões de Melhoria (Antigravity)

1.  **Dashboard de Lucro Real:** Cruzar automaticamente a receita de bilhetes com a tabela de despesas para mostrar o lucro líquido ao organizador em tempo real.
2.  **Limite de Uso de Promocodes:** Permitir que o organizador defina um limite máximo (ex: o código do RP X só funciona para os primeiros 50 bilhetes).
3.  **PDF/Wallet Integration:** Gerar um PDF formatado para impressão ou download do bilhete com o QR code.
4.  **Filtros de Eventos:** Adicionar filtros por data ou categoria na Homepage para facilitar a navegação quando houver muitos eventos.
5.  **Analytics de Origem:** No dashboard, mostrar ao organizador de onde vêm as vendas (ex: 40% direto, 50% via RPs, 10% pesquisa).
