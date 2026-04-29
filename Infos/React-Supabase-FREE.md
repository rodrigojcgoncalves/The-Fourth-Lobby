# 🆓 React + Supabase - Plano 100% GRATUITO

> Build The Fourth Lobby completamente grátis usando free tiers

**Stack:** React 18 + Vite + Supabase (free) + shadcn/ui + Zustand + Recharts
**Hosting:** Vercel (free) + Supabase (free)
**Custo Total:** €0,00
**Timeline:** 6-8 semanas

---

## 📊 Free Tiers Disponíveis

| Serviço | Free Tier | Limite | Suficiente? |
|---------|-----------|--------|------------|
| **Supabase** | Sim | 500K read/write/mês | ✅ Sim (projeto de curso) |
| **Vercel** | Sim | Ilimitado | ✅ Sim |
| **GitHub** | Sim | Ilimitado | ✅ Sim |
| **Stripe** | Sim* | Sem limite | ✅ Sim (teste mode) |
| **Netlify** | Sim | Ilimitado | ✅ Alternativa a Vercel |
| **Resend** | Sim | 100 emails/dia | ✅ Suficiente |

*Stripe não cobra até processar pagamentos reais

---

## 🚀 Setup Inicial (GRÁTIS)

### 1. Criar Conta Supabase (FREE)

```bash
# Ir para https://supabase.com
# Sign up com GitHub (mais fácil)
# Criar novo projeto (free tier automático)
```

**O que gets no free tier:**
- PostgreSQL database ilimitado
- 500K reads/writes por mês
- Autenticação (ilimitada de utilizadores)
- Storage 1GB
- Realtime (ilimitado)
- Backups diários
- SSL automático

### 2. Criar Conta Vercel (FREE)

```bash
# Ir para https://vercel.com
# Sign up com GitHub
# Conectar repositório
```

**O que gets no free tier:**
- Unlimited deployments
- Auto CI/CD do GitHub
- Custom domain (com .vercel.app)
- Certificates SSL grátis
- Analytics bem simples

### 3. Setup Local React

```bash
# Criar projeto
npm create vite@latest the-fourth-lobby -- --template react
cd the-fourth-lobby

# Instalar dependencies (SEM custos)
npm install
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx shadcn-ui@latest init

# Dependencies principais (tudo open-source/grátis)
npm install zustand @supabase/supabase-js
npm install react-router-dom recharts qrcode.react
npm install @stripe/react-stripe-js stripe
npm install axios date-fns

# Inicializar Git
git init
git add .
git commit -m "Initial commit"
```

### 4. .env Configuração

```env
# .env.local (NUNCA fazer commit!)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_STRIPE_PUBLIC_KEY=pk_test_... (não tem custo em test mode)
```

---

## 📱 Fase 1: Setup Básico + Auth (GRÁTIS)

### 1.1 Estrutura do Projeto

```
the-fourth-lobby/
├── src/
│   ├── components/
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RegisterForm.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── events/
│   │   │   ├── EventCard.tsx
│   │   │   └── EventList.tsx
│   │   ├── tickets/
│   │   │   ├── QRDisplay.tsx
│   │   │   └── TicketCard.tsx
│   │   └── common/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Events.tsx
│   │   ├── Tickets.tsx
│   │   ├── Dashboard.tsx
│   │   └── NotFound.tsx
│   ├── store/
│   │   ├── authStore.ts
│   │   └── eventStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── .env.example
├── vite.config.ts
├── package.json
└── README.md
```

### 1.2 Supabase Client

```typescript
// src/services/supabaseClient.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### 1.3 Auth Store (Zustand)

```typescript
// src/store/authStore.ts
import { create } from 'zustand'
import { supabase } from '@/services/supabaseClient'

interface User {
  id: string
  email: string
  full_name: string
  role: 'customer' | 'promoter' | 'organizer'
}

interface AuthStore {
  user: User | null
  loading: boolean
  error: string | null
  signup: (email: string, password: string, name: string, role: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  loading: false,
  error: null,

  signup: async (email, password, full_name, role) => {
    try {
      set({ loading: true, error: null })

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name, role },
        },
      })

      if (error) throw error

      // Create user profile
      if (data.user) {
        await supabase.from('users').insert({
          id: data.user.id,
          email,
          full_name,
          role,
        })
      }

      set({ loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  login: async (email, password) => {
    try {
      set({ loading: true, error: null })

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      // Fetch user profile
      const { data: profile } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user?.id)
        .single()

      set({ user: profile, loading: false })
    } catch (error: any) {
      set({ error: error.message, loading: false })
      throw error
    }
  },

  logout: async () => {
    try {
      await supabase.auth.signOut()
      set({ user: null })
    } catch (error: any) {
      set({ error: error.message })
    }
  },
}))
```

---

## 🗄️ Fase 2: Database Setup (GRÁTIS no Supabase)

### 2.1 SQL Schema (Copiar no Supabase Dashboard)

Ir a **Supabase Dashboard → SQL Editor** e correr este script:

```sql
-- Users
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('customer', 'promoter', 'organizer')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Events
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url VARCHAR(255),
  location VARCHAR(255) NOT NULL,
  date_time TIMESTAMP NOT NULL,
  capacity INT NOT NULL,
  promoter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'finished', 'cancelled')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Ticket Phases
CREATE TABLE ticket_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  total_quantity INT NOT NULL,
  sold_quantity INT DEFAULT 0,
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL
);

-- Tickets
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  phase_id UUID NOT NULL REFERENCES ticket_phases(id),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  price DECIMAL(10, 2) NOT NULL,
  purchase_date TIMESTAMP DEFAULT NOW(),
  status VARCHAR(50) DEFAULT 'valid' CHECK (status IN ('valid', 'used', 'cancelled')),
  qr_code TEXT,
  used_at TIMESTAMP
);

-- Orders
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Row-Level Security (RLS) - Segurança grátis!
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Anyone can view live events"
  ON events FOR SELECT
  USING (status = 'live');

CREATE POLICY "Users can view their own tickets"
  ON tickets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);
```

### 2.2 Índices para Performance (GRÁTIS)

```sql
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_promoter ON events(promoter_id);
CREATE INDEX idx_tickets_user ON tickets(user_id);
CREATE INDEX idx_tickets_event ON tickets(event_id);
CREATE INDEX idx_tickets_status ON tickets(status);
CREATE INDEX idx_orders_user ON orders(user_id);
```

---

## 🎨 Fase 3: Componentes Básicos (GRÁTIS)

### 3.1 Login Form

```typescript
// src/components/auth/LoginForm.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function LoginForm() {
  const navigate = useNavigate()
  const { login, loading, error } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-4 p-6">
      <h2 className="text-2xl font-bold">Login</h2>
      
      <Input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
        required
      />

      <Input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        required
      />

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  )
}
```

### 3.2 Event List

```typescript
// src/components/events/EventList.tsx
import { useEffect, useState } from 'react'
import { supabase } from '@/services/supabaseClient'
import { EventCard } from './EventCard'

export function EventList() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('status', 'live')
        .order('date_time', { ascending: false })

      if (error) throw error
      setEvents(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <p>Loading events...</p>
  if (error) return <p className="text-red-500">{error}</p>
  if (!events.length) return <p>No events available</p>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  )
}
```

### 3.3 Event Card

```typescript
// src/components/events/EventCard.tsx
import { Link } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface EventCardProps {
  event: any
}

export function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date_time).toLocaleDateString('pt-PT', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {event.image_url && (
        <img
          src={event.image_url}
          alt={event.title}
          className="w-full h-40 object-cover"
        />
      )}
      <CardHeader>
        <CardTitle className="line-clamp-2">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-600">{event.location}</p>
        <p className="text-sm">{eventDate}</p>
        <p className="text-sm line-clamp-2">{event.description}</p>
        <Link to={`/events/${event.id}`}>
          <Button className="w-full">View Event</Button>
        </Link>
      </CardContent>
    </Card>
  )
}
```

---

## 🎟️ Fase 4: Tickets & QR Codes (GRÁTIS)

### 4.1 QR Display (usando qrcode-react GRÁTIS)

```typescript
// src/components/tickets/QRDisplay.tsx
import QRCode from 'qrcode.react'
import { Button } from '@/components/ui/button'

interface QRDisplayProps {
  value: string
  size?: number
}

export function QRDisplay({ value, size = 200 }: QRDisplayProps) {
  const qrRef = React.useRef<HTMLDivElement>(null)

  const downloadQR = () => {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return

    const url = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.href = url
    link.download = `ticket-${value}.png`
    link.click()
  }

  return (
    <div className="text-center space-y-4">
      <div ref={qrRef}>
        <QRCode
          value={value}
          size={size}
          level="H"
          includeMargin={true}
          renderAs="canvas"
        />
      </div>
      <Button onClick={downloadQR} variant="outline">
        Download QR
      </Button>
    </div>
  )
}
```

### 4.2 Ticket Card

```typescript
// src/components/tickets/TicketCard.tsx
import { QRDisplay } from './QRDisplay'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TicketCardProps {
  ticket: any
}

export function TicketCard({ ticket }: TicketCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{ticket.events.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Phase</p>
          <p className="font-semibold">{ticket.ticket_phases.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Price</p>
          <p className="text-xl font-bold">€{ticket.price.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600 mb-2">QR Code</p>
          <QRDisplay value={ticket.id} size={150} />
        </div>
        <div>
          <p className="text-xs text-gray-500">Status: {ticket.status}</p>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

## 💳 Fase 5: Payments (Stripe em TEST MODE = GRÁTIS)

### 5.1 Stripe Test Cards (Grátis para testar)

```
✅ Visa bem-sucedido:  4242 4242 4242 4242
❌ Visa falha:         4000 0000 0000 0002
🔒 Verificação 3D:     4000 0025 0000 3155

Qualquer data futura + qualquer CVC
```

### 5.2 Checkout Setup

```bash
# Instalar Stripe (grátis)
npm install @stripe/react-stripe-js stripe
```

```typescript
// src/main.tsx
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLIC_KEY
)

export function App() {
  return (
    <Elements stripe={stripePromise}>
      {/* Your app */}
    </Elements>
  )
}
```

### 5.3 Simple Checkout

```typescript
// src/components/checkout/CheckoutForm.tsx
import { useState } from 'react'
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { supabase } from '@/services/supabaseClient'
import { Button } from '@/components/ui/button'

interface CheckoutFormProps {
  items: any[]
  total: number
}

export function CheckoutForm({ items, total }: CheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)

    try {
      // Get card element
      const cardElement = elements.getElement(CardElement)
      if (!cardElement) throw new Error('Card element not found')

      // Create payment method
      const { paymentMethod, error } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      })

      if (error) throw error

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Create order in database
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: user.id,
          total_amount: total,
          status: 'completed',
          payment_method: 'stripe_test',
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create tickets for each item
      for (const item of items) {
        await supabase.from('tickets').insert({
          event_id: item.event_id,
          phase_id: item.phase_id,
          user_id: user.id,
          price: item.price,
          status: 'valid',
          qr_code: `TICKET-${order.id}`,
        })
      }

      setSuccess(true)
    } catch (error: any) {
      console.error('Payment error:', error.message)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return <p className="text-green-500">Payment successful! Tickets created.</p>
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      <CardElement className="p-3 border rounded" />
      
      <div className="border-t pt-4">
        <p className="text-lg font-bold">Total: €{total.toFixed(2)}</p>
      </div>

      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading ? 'Processing...' : 'Complete Purchase'}
      </Button>
    </form>
  )
}
```

---

## 📊 Fase 6: Dashboards Simples (GRÁTIS)

### 6.1 Dashboard Stats

```typescript
// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { supabase } from '@/services/supabaseClient'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function Dashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    ticketsOwned: 0,
    ticketsUsed: 0,
    totalSpent: 0,
  })

  useEffect(() => {
    if (!user) return
    fetchStats()
  }, [user?.id])

  const fetchStats = async () => {
    try {
      // Get user tickets
      const { data: tickets } = await supabase
        .from('tickets')
        .select('*')
        .eq('user_id', user?.id)

      const ticketsOwned = tickets?.length || 0
      const ticketsUsed = tickets?.filter((t) => t.status === 'used').length || 0
      const totalSpent = tickets?.reduce((sum, t) => sum + (t.price || 0), 0) || 0

      setStats({ ticketsOwned, ticketsUsed, totalSpent })
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.ticketsOwned}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tickets Used</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.ticketsUsed}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Spent</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">€{stats.totalSpent.toFixed(2)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

---

## 🌐 Fase 7: Deploy Grátis (VERCEL)

### 7.1 Preparar Projeto

```bash
# Commit tudo
git add .
git commit -m "Ready to deploy"

# Push para GitHub
git push origin main
```

### 7.2 Deploy em Vercel (5 minutos)

```bash
# Opção 1: Via CLI
npm i -g vercel
vercel

# Opção 2: Via Vercel Dashboard
# 1. Ir a https://vercel.com
# 2. Sign in com GitHub
# 3. Import project
# 4. Add environment variables (do .env.local)
# 5. Deploy!
```

### 7.3 Vercel Environment Variables

No dashboard Vercel, adiciona:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLIC_KEY=pk_test_...
```

---

## 📧 Fase 8: Email (GRÁTIS com Resend ou Local)

### 8.1 Opção A: Resend (100 emails/dia GRÁTIS)

```bash
npm install resend
```

```typescript
// src/services/emailService.ts
import { Resend } from 'resend'

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY)

export async function sendOrderConfirmation(
  email: string,
  orderId: string,
  tickets: any[]
) {
  try {
    await resend.emails.send({
      from: 'noreply@thefourthlobby.com',
      to: email,
      subject: 'Order Confirmation',
      html: `
        <h2>Order Confirmed!</h2>
        <p>Order ID: ${orderId}</p>
        <p>Tickets: ${tickets.length}</p>
      `,
    })
  } catch (err) {
    console.error('Email sending failed:', err)
  }
}
```

### 8.2 Opção B: Print no Console (Desenvolvimento)

```typescript
// src/services/emailService.ts
export async function sendOrderConfirmation(
  email: string,
  orderId: string,
  tickets: any[]
) {
  console.log(`📧 Email enviado para: ${email}`)
  console.log(`Order ID: ${orderId}`)
  console.log(`Tickets: ${tickets.length}`)
}
```

---

## ✅ Checklist de Deployment

```
□ Supabase project criado (free tier)
□ Database schema executado
□ RLS policies aplicadas
□ Repository no GitHub criado
□ Environment variables definidas
□ React app buildado e testado
□ Vercel account criado
□ Deploy inicial feito
□ Custom domain (opcional)
□ SSL automático (Vercel faz)
□ Monitoring básico ativo
```

---

## 🎯 O que Ficou 100% GRÁTIS

✅ **Frontend:** Vercel (unlimited)  
✅ **Backend:** Supabase (500K ops/mês)  
✅ **Autenticação:** Supabase Auth  
✅ **Database:** PostgreSQL no Supabase  
✅ **File Storage:** Supabase Storage 1GB  
✅ **Realtime:** Supabase Realtime  
✅ **Payments:** Stripe test mode  
✅ **QR Codes:** qrcode-react library  
✅ **Email:** Resend (100/dia)  
✅ **Hosting:** Vercel  
✅ **SSL:** Automático  
✅ **CI/CD:** GitHub Actions (free)  
✅ **Monitoring:** Básico incluído

**TOTAL: €0,00** 💸

---

## 📊 Limites Free Tier (Suficientes para projeto de curso)

| Serviço | Limite | É Suficiente? |
|---------|--------|---------------|
| Supabase reads | 500K/mês | ✅ Sim (700/dia) |
| Supabase writes | 500K/mês | ✅ Sim (700/dia) |
| Supabase storage | 1GB | ✅ Sim |
| Vercel bandwidth | 100GB/mês | ✅ Sim |
| Vercel builds | Ilimitados | ✅ Sim |
| Resend emails | 100/dia | ✅ Sim |
| Stripe transactions | Ilimitadas (teste) | ✅ Sim |

---

## 🚀 Timeline (8 semanas)

### Semana 1
- Setup Supabase + database
- Setup React local + Vercel
- Auth básica

### Semana 2-3
- Event CRUD
- Event listing + details
- Component library

### Semana 4
- Ticket system
- QR code generation

### Semana 5
- Stripe test integration
- Checkout flow

### Semana 6
- Dashboard básico
- Stats e informações

### Semana 7
- Melhorias UI
- Testing

### Semana 8
- Deploy final
- Documentation

---

## 📝 Próximos Passos

1. **Criar conta Supabase gratuita:**
   ```
   https://supabase.com → Sign up com GitHub
   ```

2. **Criar novo projeto** (free tier automático)

3. **Copiar schema SQL** acima para SQL Editor

4. **Criar repositório GitHub:**
   ```bash
   git init
   git branch -M main
   git remote add origin https://github.com/your-username/the-fourth-lobby
   git push -u origin main
   ```

5. **Deploy em Vercel:**
   ```
   https://vercel.com → Import GitHub repo
   ```

6. **Começar a desarrollar!**

---

**Stack Final:** React 18 + Vite + Supabase + shadcn/ui + Zustand + Recharts  
**Custo:** €0,00  
**Tempo:** 8 semanas  
**Status:** 🚀 Totalmente gratuito para projeto de curso!
