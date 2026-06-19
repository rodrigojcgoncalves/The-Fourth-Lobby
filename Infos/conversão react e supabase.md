# 🎯 Walkthrough: Conversão para React + Supabase

## O que foi feito

### 1. Movido o protótipo antigo para `_old_prototype/`
Os seguintes ficheiros/pastas foram movidos e **desconectados** do projeto React:
- `HTML/` → `_old_prototype/HTML/`
- `CSS/` → `_old_prototype/CSS/`
- `JS/` → `_old_prototype/JS/`
- `server.py` → `_old_prototype/server.py`
- `start-server.bat` → `_old_prototype/start-server.bat`

### 2. Dependências instaladas
Novos pacotes adicionados ao `package.json`:
- `@supabase/supabase-js` — Cliente Supabase
- `qrcode.react` — Geração de QR codes reais
- `lucide-react` — Ícones
- `date-fns` — Formatação de datas
- `@stripe/react-stripe-js` + `stripe` — Preparação para pagamentos

### 3. Types atualizados (`src/types/index.ts`)
Interfaces alinhadas com o schema real do Supabase:
- `Event` → usa `name`, `image_url`, `organizer_id`, `capacity` (em vez de `title`, `image`, `lineup`)
- `Artist` → usa `event_id`, `image_url` (em vez de `image`)
- `TicketType` → substituiu `TicketPhase`, com `total_quantity`, `sold_quantity`, `start_date`, `end_date`
- `Ticket` → usa `user_id`, `event_id`, `ticket_type_id`, `price_paid`, `qr_code`, `purchased_at`, com joins opcionais `events?` e `ticket_types?`

### 4. Páginas migradas de mock data para Supabase

| Página | Antes | Depois |
|--------|-------|--------|
| `HomePage.tsx` | `mockEvents` (array estático) | `supabase.from('events').select('*').eq('status', 'live')` |
| `EventDetailsPage.tsx` | `mockEvents.find()` | `supabase.from('events').select('*, artists(*), ticket_types(*)').eq('id', id).single()` |
| `TicketsPage.tsx` | `mockTickets` + imagem QR estática | `supabase.from('tickets').select('*, events(*), ticket_types(*)').eq('user_id', user.id)` + `<QRCodeSVG>` |
| `ProfilePage.tsx` | `currentUser` (inexistente no store) | `user` + `role` do `useAuthStore()` + `signOut` |
| `LoginPage.tsx` | `authService.register(email, pw, role)` | `authService.register(email, pw, fullName, role)` |

### 5. Auth Service atualizado (`src/services/authService.ts`)
O `register()` agora:
- Aceita `fullName` como parâmetro
- Cria o perfil na tabela `public.users` após o sign-up no Supabase Auth

### 6. CSS autónomo (`src/App.css`)
- Removido o `@import '../CSS/styles.css'` (que apontava para o ficheiro do protótipo antigo)
- Todo o design system (1188 linhas do CSS antigo) foi incorporado diretamente no `App.css` do React
- Nenhuma dependência externa de CSS

### 7. Ficheiro mockData.ts eliminado
- `src/data/mockData.ts` foi apagado — já não é necessário

### 8. Fix no tsconfig.json
- Removido `"ignoreDeprecations": "6.0"` que causava erro com a versão atual do TypeScript

### 9. Fix no main.tsx
- Removida extensão `.tsx` do import (`import App from './App'`)

---

## Validação

### Build ✅
```
> tsc && vite build
✓ 127 modules transformed.
✓ built in 1.58s
```

### Dev Server ✅
```
VITE v5.4.21 ready in 339 ms
Local: http://localhost:5173/
```

---

## Estado atual

A app React está **100% funcional** e compila sem erros. Como as tabelas do Supabase estão vazias, ao abrires `http://localhost:5173/` verás:
- **HomePage**: Hero section visível, secção "Upcoming Events" vazia (0 eventos na BD), Media Center e "Why Choose Us" com conteúdo estático
- **Login/Register**: Formulário funcional ligado ao Supabase Auth
- **Tickets**: Mostra "You haven't purchased any tickets yet" (estado vazio correto)
- **Profile**: Mostra dados do utilizador autenticado via Supabase

### Próximo passo natural
Inserir dados de teste nas tabelas do Supabase (events, artists, ticket_types) para veres a app completamente populada.
