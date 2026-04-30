# Plano de Implementação: Melhorias no Upload, Edição e URLs Amigáveis (Slugs)

Este plano resolve os problemas com upload de fotos de artistas, adiciona a funcionalidade de Edição de Eventos e implementa slugs baseados no nome do evento para melhorar o SEO e a estética dos links.

## User Review Required

- **Alteração do Schema:** É necessário correr um script SQL para adicionar a coluna `slug` na tabela `events` e preencher os dados antigos.
- **Relações de Edição:** Ao editar o evento, as fases antigas e os artistas associados serão removidos e reinseridos para manter a consistência da relação.

## Open Questions

- Como lidar com slugs duplicados? (Se houver 2 eventos com o mesmo nome exato, o slug gerará conflito se for UNIQUE. Proponho adicionar uma string aleatória curta no final ou apenas confiar que nomes de eventos são únicos o suficiente para este contexto académico).

## Proposed Changes

### [Component Name] Backend (Express)

#### [MODIFY] [server.js](file:///c:/Users/rodri/OneDrive/Documentos/INFOWEB/Projeto%20Final%20De%20Curso/the-fourth-lobby/backend/server.js)
- Adicionar middleware global de captura de erros no final do ficheiro (antes do `app.listen`) para que o `multer` e outros pacotes respondam em formato JSON em caso de erro, eliminando o aviso "Unexpected token <".

#### [MODIFY] [events.js](file:///c:/Users/rodri/OneDrive/Documentos/INFOWEB/Projeto%20Final%20De%20Curso/the-fourth-lobby/backend/routes/events.js)
- Adicionar função helper `slugify(text)`.
- **POST `/`**: Gerar e guardar o `slug` no banco.
- **PUT `/:id`**: Atualizar o evento e também gerir a substituição das fases de bilhetes (`ticket_types`) e ligações de artistas (`event_artists`).

### [Component Name] Frontend (React)

#### [MODIFY] [routes.tsx](file:///c:/Users/rodri/OneDrive/Documentos/INFOWEB/Projeto%20Final%20De%20Curso/the-fourth-lobby/src/routes.tsx)
- Adicionar rota para a página de edição: `/organizer/edit-event/:id`.
- Mudar a rota pública de detalhes de `/events/:id` para `/events/:slug`.

#### [MODIFY] [EventCard.tsx](file:///c:/Users/rodri/OneDrive/Documentos/INFOWEB/Projeto%20Final%20De%20Curso/the-fourth-lobby/src/components/EventCard.tsx)
- Atualizar navegação para usar `event.slug` em vez do UUID.

#### [MODIFY] [EventDetailsPage.tsx](file:///c:/Users/rodri/OneDrive/Documentos/INFOWEB/Projeto%20Final%20De%20Curso/the-fourth-lobby/src/pages/EventDetailsPage.tsx)
- Mudar a query do Supabase para procurar por `.eq('slug', id)` e buscar via nome da URL amigável.

#### [NEW] [EditEventPage.tsx](file:///c:/Users/rodri/OneDrive/Documentos/INFOWEB/Projeto%20Final%20De%20Curso/the-fourth-lobby/src/pages/EditEventPage.tsx)
- Replicar a UI do `CreateEventPage.tsx` mas carregando dados iniciais (`useEffect` com fetch) e enviando um `PUT` ao salvar.

#### [MODIFY] [OrganizerDashboard.tsx](file:///c:/Users/rodri/OneDrive/Documentos/INFOWEB/Projeto%20Final%20De%20Curso/the-fourth-lobby/src/pages/OrganizerDashboard.tsx)
- Adicionar coluna de Ações com botão "Editar" para encaminhar para `/organizer/edit-event/:id`.

## Verification Plan

### Manual Verification
- Carregar uma imagem de artista maior de 5MB e ver se aparece um erro JSON limpo.
- Criar evento e ver se o slug é gerado.
- Navegar na Home e clicar em "View Event" para testar `/events/slug-do-evento`.
- Aceder ao Dashboard do Organizador, clicar em "Editar", alterar uma fase e salvar.
