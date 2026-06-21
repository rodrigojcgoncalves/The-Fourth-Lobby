perguntas professor

faz sentido este site ser exclusivo para a minha label? ao invés de ser um market place

# 1. Criação da base de dados.

## Este foi o scrip usado no SQL Editor do supabase para a criação da Base de Dados

```

-- 1. EXTENSÕES E TIPOS (ENUMS)
create extension if not exists "uuid-ossp";

create type user_role as enum ('customer', 'promoter', 'organizer');
create type event_status as enum ('draft', 'published', 'finished');
create type order_status as enum ('pending', 'completed', 'failed');
create type ticket_status as enum ('valid', 'used', 'refunded');

-- 2. TABELAS PRINCIPAIS

-- Tabela de utilizadores (espelho da auth.users do Supabase)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role user_role default 'customer',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Eventos
create table public.events (
  id uuid primary key default uuid_generate_v4(),
  organizer_id uuid references public.users(id) not null,
  name text not null,
  description text,
  date timestamp with time zone not null,
  location text,
  capacity int not null,
  image_url text,
  status event_status default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Artistas
create table public.artists (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  name text not null,
  bio text,
  image_url text,
  genre text
);

-- Tipos de Bilhetes / Fases
create table public.ticket_types (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  name text not null,
  price decimal(10,2) not null,
  total_quantity int not null,
  sold_quantity int default 0,
  start_date timestamp with time zone,
  end_date timestamp with time zone
);

-- Encomendas (Transações Financeiras)
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id),
  total_amount decimal(10,2) not null,
  stripe_payment_id text,
  status order_status default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Itens da Encomenda
create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  ticket_type_id uuid references public.ticket_types(id),
  quantity int not null
);

-- Promotores (RPs)
create table public.promoters (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) unique,
  referral_code text unique not null,
  commission_rate decimal(5,2) default 0.00,
  total_earned decimal(10,2) default 0.00
);

-- Bilhetes (Ativos individuais)
create table public.tickets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id),
  event_id uuid references public.events(id),
  ticket_type_id uuid references public.ticket_types(id),
  order_id uuid references public.orders(id),
  price_paid decimal(10,2),
  status ticket_status default 'valid',
  qr_code text unique not null,
  purchased_at timestamp with time zone default timezone('utc'::text, now())
);

-- Conversões de Afiliados
create table public.affiliate_conversions (
  id uuid primary key default uuid_generate_v4(),
  promoter_id uuid references public.promoters(id),
  ticket_id uuid references public.tickets(id),
  commission_amount decimal(10,2) not null,
  status text default 'pending' -- pending, paid
);

-- Despesas Operacionais
create table public.expenses (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  description text not null,
  category text,
  amount decimal(10,2) not null,
  date date not null
);

-- Análise de Sentimento (NLP)
create table public.sentiment_analyses (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  platform text,
  sentiment_score decimal(3,2), -- -1.00 a 1.00
  collected_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. ÍNDICES PARA PERFORMANCE
create index idx_events_organizer on public.events(organizer_id);
create index idx_tickets_user on public.tickets(user_id);
create index idx_tickets_event on public.tickets(event_id);
create index idx_orders_user on public.orders(user_id);
create index idx_promoter_code on public.promoters(referral_code);

-- 4. TRIGGER PARA SINCRONIZAR AUTH.USERS COM PUBLIC.USERS
-- Este trigger cria automaticamente uma entrada na tabela pública quando alguém faz Sign-up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, role)
  values (new.id, new.email, 'customer');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 5. ROW LEVEL SECURITY (RLS) POLICIES

-- Ativar RLS em todas as tabelas
alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.tickets enable row level security;
alter table public.expenses enable row level security;
alter table public.promoters enable row level security;

-- Políticas para Eventos
create policy "Qualquer pessoa vê eventos publicados"
  on public.events for select
  using (status = 'published');

create policy "Organizadores gerem os seus próprios eventos"
  on public.events for all
  using (auth.uid() = organizer_id);

-- Políticas para Bilhetes
create policy "Utilizadores vêem os seus próprios bilhetes"
  on public.tickets for select
  using (auth.uid() = user_id);

create policy "Organizadores vêem bilhetes dos seus eventos"
  on public.tickets for select
  using (
    exists (
      select 1 from public.events
      where events.id = tickets.event_id
      and events.organizer_id = auth.uid()
    )
  );

-- Políticas para Despesas (Apenas Organizadores)
create policy "Apenas organizadores vêem e gerem despesas"
  on public.expenses for all
  using (
    exists (
      select 1 from public.events
      where events.id = expenses.event_id
      and events.organizer_id = auth.uid()
    )
  );
--
Notas de Implementação no Supabase:
Security Definer: A função handle_new_user usa security definer para que possa escrever na tabela public.users mesmo que o utilizador ainda não tenha permissões (no momento exato do registo).

Stripe: Quando o Stripe confirmar o pagamento, o teu backend deve dar UPDATE na tabela orders para status = 'completed'. Podes criar um trigger no Postgres para gerar as linhas na tabela tickets automaticamente quando uma order for paga.

RLS: As políticas que defini garantem que um utilizador comum nunca veja as despesas de um organizador nem os bilhetes de outras pessoas. Isto é o "ponto de honra" da segurança em aplicações modernas.

```

## 1.1 Algumas políticas de RLS na Supabase

criei 2 buckets 'USER-AVATARS' e 'EVENT-IMAGES'

estes têm algumas policies de RLS por segurança, politicas como:

- Public Acces: permite que qualquer utilizador, logado ou sem conta, consiga ver as imagens, tais como avatares e cartazes
- Users can update or delete their own avatar: que restringe que apenas utilizadores logados consigam alterar ou apagar o avatar, esta policie confirma também se o user é o user
- Only organizers can update or delete images: restringe apenas à role ORGANIZER o ato de alterar ou apagar imagens

### 1.1.1 !!! UPDATE NA BD !!!

```sql

-- 1. Remover a restrição de Foreign Key (A ligação ao Supabase Auth)
ALTER TABLE public.users
DROP CONSTRAINT users_id_fkey;

-- 2. Alterar a coluna 'id' para gerar automaticamente os UUIDs
-- (Porque agora é o teu sistema a criar os utilizadores, não o Supabase)
ALTER TABLE public.users
ALTER COLUMN id SET DEFAULT uuid_generate_v4();

-- 3. Adicionar a coluna para a password
ALTER TABLE public.users
ADD COLUMN password_hash text;

-- 4. Limpeza: Remover o Trigger do Supabase Auth (Já não vais precisar dele)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

```

### 1.1.2 OUTRA MUDANÇA

```sql

-- 1. Remove a coluna event_id da tabela artists
ALTER TABLE public.artists DROP COLUMN IF EXISTS event_id;

-- 2. Cria a tabela intermédia event_artists
CREATE TABLE public.event_artists (
id uuid primary key default uuid_generate_v4(),
event_id uuid references public.events(id) on delete cascade,
artist_id uuid references public.artists(id) on delete cascade,
created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Adiciona RLS
ALTER TABLE public.event_artists ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Qualquer pessoa vê os artistas dos eventos"
ON public.event_artists FOR SELECT
USING (true);

```

### 1.1.3 OUTRA MUDANÇA - PERMITIR UPLOAD DE FOTOS E LINK PERSONALIZADO

```sql
-- 1. Adicionar coluna slug à tabela events
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS slug text;

-- 2. Preencher slugs para eventos existentes (baseado no nome)
UPDATE public.events
SET slug = lower(
regexp_replace(
regexp_replace(
translate(name, 'áàãâäéèêëíìîïóòõôöúùûüç', 'aaaaaeeeeiiiiooooouuuuc'),
'[^a-z0-9\s-]', '', 'g'
),
'\s+', '-', 'g'
)
)
WHERE slug IS NULL;

-- 3. Garantir unicidade (opcional mas recomendado)
CREATE UNIQUE INDEX IF NOT EXISTS events_slug_unique ON public.events (slug);

```

### 1.1.4 ADICIONAR LINHA DE DESCRIÇÃO DE FASES

```sql

-- Adicionar campo de descrição às fases de bilhetes
ALTER TABLE public.ticket_types
ADD COLUMN IF NOT EXISTS description text;

```

### 1.1.5 Correção de venda de bilhetes esgotados, e apagar tickets ao editar evento

```sql

-- 1. Função Atómica para RESERVAR bilhetes
CREATE OR REPLACE FUNCTION reserve_tickets(p_ticket_type_id UUID, p_quantity INT)
RETURNS BOOLEAN AS $$
DECLARE
  v_available INT;
BEGIN
  -- Faz o bloqueio (lock) na linha específica da fase de bilhetes
  SELECT (total_quantity - sold_quantity) INTO v_available
  FROM public.ticket_types
  WHERE id = p_ticket_type_id
  FOR UPDATE;

  -- Se houver stock suficiente, atualiza e retorna TRUE
  IF v_available >= p_quantity THEN
    UPDATE public.ticket_types
    SET sold_quantity = sold_quantity + p_quantity
    WHERE id = p_ticket_type_id;
    RETURN TRUE;
  ELSE
    -- Se não houver, bloqueia a compra
    RETURN FALSE;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Função Atómica para LIBERTAR bilhetes (Usada em caso de Rollback/Erro na compra)
CREATE OR REPLACE FUNCTION release_tickets(p_ticket_type_id UUID, p_quantity INT)
RETURNS VOID AS $$
BEGIN
  -- Devolve o stock, garantindo que não fica com valores negativos
  UPDATE public.ticket_types
  SET sold_quantity = GREATEST(sold_quantity - p_quantity, 0)
  WHERE id = p_ticket_type_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

```

#### 1.1.x CÓDIGO SQL ATUALIZADO PARA FAZER O DIAGRAMA FINAL

```sql
-- 1. EXTENSÕES E TIPOS (ENUMS)
create extension if not exists "uuid-ossp";

create type user_role as enum ('customer', 'promoter', 'organizer');
create type event_status as enum ('draft', 'published', 'finished', 'live', 'cancelled');
create type order_status as enum ('pending', 'completed', 'failed');
create type ticket_status as enum ('valid', 'used', 'refunded');

-- 2. TABELAS PRINCIPAIS

-- Tabela de utilizadores (Independente do Supabase Auth para este projeto)
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  password_hash text,
  role user_role default 'customer',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Eventos
create table public.events (
  id uuid primary key default uuid_generate_v4(),
  organizer_id uuid references public.users(id) not null,
  name text not null,
  slug text unique,
  description text,
  date timestamp with time zone not null,
  location text,
  capacity int not null,
  image_url text,
  status event_status default 'draft',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Artistas (Global, sem ligação direta a evento)
create table public.artists (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  bio text,
  image_url text,
  genre text
);

-- Tabela Intermédia Evento <-> Artista (Many-to-Many)
create table public.event_artists (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  artist_id uuid references public.artists(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Tipos de Bilhetes / Fases
create table public.ticket_types (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  name text not null,
  price decimal(10,2) not null,
  total_quantity int not null,
  sold_quantity int default 0,
  start_date timestamp with time zone,
  end_date timestamp with time zone
);

-- Encomendas (Transações Financeiras)
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id),
  total_amount decimal(10,2) not null,
  stripe_payment_id text,
  status order_status default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Itens da Encomenda
create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  ticket_type_id uuid references public.ticket_types(id),
  quantity int not null
);

-- Bilhetes (Ativos individuais)
create table public.tickets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id),
  event_id uuid references public.events(id),
  ticket_type_id uuid references public.ticket_types(id),
  order_id uuid references public.orders(id),
  price_paid decimal(10,2),
  status ticket_status default 'valid',
  qr_code text unique not null,
  purchased_at timestamp with time zone default timezone('utc'::text, now())
);

-- Promotores (RPs)
create table public.promoters (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) unique,
  referral_code text unique not null,
  commission_rate decimal(5,2) default 0.00,
  total_earned decimal(10,2) default 0.00
);

-- Conversões de Afiliados
create table public.affiliate_conversions (
  id uuid primary key default uuid_generate_v4(),
  promoter_id uuid references public.promoters(id),
  ticket_id uuid references public.tickets(id),
  commission_amount decimal(10,2) not null,
  status text default 'pending'
);

-- Despesas Operacionais
create table public.expenses (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  description text not null,
  category text,
  amount decimal(10,2) not null,
  date date not null
);

-- Análise de Sentimento (NLP)
create table public.sentiment_analyses (
  id uuid primary key default uuid_generate_v4(),
  event_id uuid references public.events(id) on delete cascade,
  platform text,
  sentiment_score decimal(3,2),
  collected_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. ÍNDICES
create index idx_events_organizer on public.events(organizer_id);
create index idx_events_slug on public.events(slug);
create index idx_tickets_user on public.tickets(user_id);
create index idx_tickets_event on public.tickets(event_id);
create index idx_orders_user on public.orders(user_id);
create index idx_promoter_code on public.promoters(referral_code);

-- 4. ROW LEVEL SECURITY (RLS)
alter table public.users enable row level security;
alter table public.events enable row level security;
alter table public.artists enable row level security;
alter table public.event_artists enable row level security;
alter table public.tickets enable row level security;
alter table public.expenses enable row level security;
alter table public.promoters enable row level security;

-- Políticas de exemplo
create policy "Qualquer pessoa vê eventos publicados"
  on public.events for select
  using (status = 'published');

create policy "Organizadores gerem os seus próprios eventos"
  on public.events for all
  using (auth.uid() = organizer_id);

create policy "Qualquer pessoa vê artistas"
  on public.artists for select
  using (true);

create policy "Qualquer pessoa vê artistas dos eventos"
  on public.event_artists for select
  using (true);
```

### Criar tabelas de labels, para melhor organização a longo prazo dos eventos

```sql

-- Adicionar as colunas novas à tabela expenses existente
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS is_paid boolean default false;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS paid_by text;

-- 1. Criar a tabela Labels
CREATE TABLE public.labels (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references public.users(id) on delete cascade unique not null,
  name text not null,
  slug text unique not null,
  bio text,
  logo_url text,
  banner_url text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Qualquer pessoa vê as labels públicas" ON public.labels FOR SELECT USING (true);
CREATE POLICY "Organizadores gerem a sua própria label" ON public.labels FOR ALL USING (auth.uid() = owner_id);

-- 2. Adicionar colunas novas à tabela expenses existente
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS is_paid boolean default false;
ALTER TABLE public.expenses ADD COLUMN IF NOT EXISTS paid_by text;


ALTER TABLE users ADD COLUMN IF NOT EXISTS full_name text;

-- ADICIONAR CENA DOS PROMOTORES

-- Criar a tabela de associação entre Labels e Promotores
CREATE TABLE public.label_promoters (
  id uuid primary key default uuid_generate_v4(),
  label_id uuid references public.labels(id) on delete cascade,
  user_id uuid references public.users(id) on delete cascade,
  status text default 'active', -- pode ser 'pending', 'active', 'rejected'
  created_at timestamp with time zone default timezone('utc'::text, now()),
  UNIQUE(label_id, user_id)
);

-- Ativar RLS (Row Level Security)
ALTER TABLE public.label_promoters ENABLE ROW LEVEL SECURITY;

-- O promotor apenas vê as labels a que pertence
CREATE POLICY "Promotor vê as suas labels"
  ON public.label_promoters FOR SELECT
  USING (auth.uid() = user_id);

-- O organizador apenas vê e gere os promotores da sua própria label
CREATE POLICY "Organizador gere os seus promotores"
  ON public.label_promoters FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.labels
      WHERE labels.id = label_promoters.label_id
      AND labels.owner_id = auth.uid()
    )
  );


-- 1. Adicionar as novas colunas à tabela labels
ALTER TABLE public.labels
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS logo_url TEXT,
ADD COLUMN IF NOT EXISTS banner_url TEXT,
ADD COLUMN IF NOT EXISTS support_email TEXT,
ADD COLUMN IF NOT EXISTS payment_info TEXT,
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- 2. Ativar o Row Level Security (RLS) na tabela labels (caso ainda não esteja ativo)
ALTER TABLE public.labels ENABLE ROW LEVEL SECURITY;

-- 3. Criar Política de Leitura: Qualquer pessoa pode ler os dados da Label (necessário para o futuro perfil público)
CREATE POLICY "Leitura Pública das Labels"
ON public.labels FOR SELECT
USING (true);

-- 4. Criar Política de Atualização: Apenas o Dono (owner_id) pode alterar a sua própria Label
CREATE POLICY "Apenas o dono pode editar a sua label"
ON public.labels FOR UPDATE
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);


```

## 1.2 Hugging Face

Criei conta na Hugging face, que é um "github" das IA, onde existem vários modelos de IA's disponiveis para serem usados por devs, o meu objetivo é usar um modelo de NLP pronto

criei token com opção de READ e adicionei ao .env

## 2. Gestão de Estado com Zustand e a Autenticação

Como as políticas de RLS estão ativas, não conseguirás testar as tabelas de eventos ou bilhetes sem um utilizador autenticado.

npm install zustand

#### Estudar melhor sobre os pagamentos para meter no relatório
