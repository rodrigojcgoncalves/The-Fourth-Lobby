# Documento de Requisitos: The Fourth Lobby

Este documento descreve os Requisitos Funcionais (RF) e Não Funcionais (RNF) estipulados para a plataforma **The Fourth Lobby**, um sistema White-label de gestão de eventos e bilhética com sistema de afiliação integrado.

---

## 1. Requisitos Funcionais (RF)

Os requisitos funcionais definem as ações específicas que o sistema deve executar e as funcionalidades disponíveis para os diferentes tipos de utilizadores (Clientes, Promotores e Organizadores).

| ID       | Título                          | Descrição                                                                                                                                                 | Prioridade |
| :------- | :------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------: |
| **RF01** | **Gestão de Eventos**           | O organizador deve poder criar, editar, eliminar e publicar eventos, definindo detalhes como nome, data, localização, capacidade e cartaz.                |
| **RF02** | **Gestão de Tipos de Bilhetes** | O sistema deve permitir a criação de múltiplas fases de venda (ex: Early Bird, 1ª Fase) com preços, descrições e quantidades limite distintas             |
| **RF03** | **Sistema de Afiliação (RPs)**  | O sistema deve suportar a criação de promotores e atribuição de códigos promocionais únicos para cada um.                                                 |
| **RF04** | **Checkout e Pagamento**        | Os clientes devem poder selecionar bilhetes e aplicar códigos promocionais no checkout, recalculando o total com desconto em tempo real.                  |
| **RF05** | **Dashboard do Organizador**    | O organizador deve ter acesso a um painel central com métricas globais de vendas (faturação e bilhetes) e gestão da sua equipa de promotores.             |
| **RF06** | **Dashboard do Promotor**       | Os promotores devem ter um portal próprio onde possam monitorizar, em tempo real, os bilhetes vendidos com o seu código e o total de comissões acumuladas |
| **RF07** | **Emissão de QR Codes**         | Após a compra bem-sucedida, o sistema deve gerar e associar um QR Code único e seguro ao bilhete digital do cliente.                                      |
| **RF08** | **Scanner de Validação**        | Deve existir uma interface dedicada para os seguranças/staff validarem as entradas à porta através da leitura do QR Code.                                 |
| **RF09** | **Perfil da Label/Organização** | O organizador deve poder personalizar a identidade da sua marca (logótipo, capa, biografia, redes sociais e email de suporte) via painel de controlo.     |
| **RF10** | **Autenticação e Perfis**       | O sistema deve gerir o registo e login de utilizadores, atribuindo permissões distintas (Cliente, Promotor, Organizador, Admin).                          |

---

## 2. Requisitos Não Funcionais (RNF)

Os requisitos não funcionais especificam os critérios de qualidade, restrições e atributos de desempenho com os quais o sistema deve operar.

| ID        | Título                                | Descrição                                                                                                                                                                                      | Categoria      |
| :-------- | :------------------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------- |
| **RNF01** | **Autorização e Controlo de Acessos** | A camada de backend (Node.js/Express) deve garantir a segurança dos dados através de middlewares de validação (Role-Based Access Control), restringindo acessos mediante o tipo de utilizador. | Segurança      |
| **RNF02** | **Design e Usabilidade**              | A interface deve possuir um aspeto _Premium_ (Dark Mode, Glassmorphism, micro-animações), sendo intuitiva e 100% responsiva (Mobile-First).                                                    | UX/UI          |
| **RNF03** | **Desempenho (SPA)**                  | A navegação entre páginas no frontend (React/Vite) não deve exigir recarregamento da página, oferecendo uma experiência fluida.                                                                | Performance    |
| **RNF04** | **Autenticação Segura**               | O sistema deve utilizar algoritmos de hashing (bcrypt) para encriptação de passwords e emitir JSON Web Tokens (JWT) para gestão segura de sessões.                                             | Segurança      |
| **RNF05** | **Gestão de Ficheiros**               | O upload de imagens (cartazes, logos) deve ser validado (tamanho máximo de 10MB, formatos suportados) e armazenado numa CDN externa (Supabase Storage).                                        | Infraestrutura |
| **RNF06** | **Escalabilidade**                    | A arquitetura backend (Node.js/Express) e de base de dados (PostgreSQL) deve estar preparada para picos de acessos simultâneos (abertura de portas de eventos).                                | Arquitetura    |
| **RNF07** | **Proteção de Dados Sensíveis**       | Dados bancários de organizadores (IBAN/SWIFT) devem estar restritos apenas ao _owner_ da Label, nunca sendo expostos na API pública.                                                           | Privacidade    |
| **RNF08** | **Manutenibilidade (DRY)**            | O código fonte deve seguir boas práticas de engenharia de software (Componentização, princípios DRY) para facilitar a futura adição de funcionalidades.                                        | Manutenção     |
