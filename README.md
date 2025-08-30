# Sistema POKER 360

Este é um aplicativo para gerenciamento de faltas de militares do Esquadrão Poker.

## Visão Geral

O Sistema POKER 360 é uma ferramenta abrangente projetada para otimizar a gestão de presença e ausência de militares. Ele oferece funcionalidades para:

- **Registro de Presença:** Marcar a presença diária dos militares.
- **Gerenciamento de Justificativas:** Registrar e aprovar justificativas para faltas (férias, missões, dispensas médicas, cursos, etc.).
- **Controle de Chaves:** Gerenciar a entrada e saída de chaves do claviculário.
- **Checklist de Permanência:** Acompanhar tarefas e verificações diárias.
- **Calendário de Eventos:** Visualizar e gerenciar eventos importantes.
- **Agendamento de Voos:** Registrar e acompanhar voos.
- **Notas Pessoais:** Permitir que os militares registrem notas e lembretes.
- **Histórico:** Acompanhar o histórico de presença, justificativas e outras atividades.
- **Dashboard de Análise:** Fornecer insights sobre padrões de presença e ausência.

## Tecnologias Utilizadas

- **Next.js:** Framework React para aplicações web.
- **Tailwind CSS:** Framework CSS para estilização rápida e responsiva.
- **shadcn/ui:** Componentes de UI reutilizáveis e acessíveis.
- **Supabase:** Backend como serviço para banco de dados, autenticação e armazenamento em tempo real.
- **Clerk:** Solução de autenticação para Next.js.
- **Lucide React:** Biblioteca de ícones.
- **AI SDK:** Para futuras integrações de IA (ex: resumos de notas, previsões).

## Configuração do Projeto

### 1. Clonar o Repositório

\`\`\`bash
git clone <URL_DO_SEU_REPOSITORIO>
cd sistema-poker-360
\`\`\`

### 2. Instalar Dependências

\`\`\`bash
npm install
# ou
yarn install
\`\`\`

### 3. Configurar Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto e adicione as seguintes variáveis:

\`\`\`env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="SUA_URL_SUPABASE"
SUPABASE_SERVICE_ROLE_KEY="SUA_SERVICE_ROLE_KEY_SUPABASE"
SUPABASE_JWT_SECRET="SEU_JWT_SECRET_SUPABASE"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="SUA_CLERK_PUBLISHABLE_KEY"
CLERK_SECRET_KEY="SUA_CLERK_SECRET_KEY"

# Outras variáveis de ambiente (se aplicável)
# OPENWEATHER_API_KEY="SUA_CHAVE_API_OPENWEATHER"
\`\`\`

**Importante:** As chaves do Clerk (`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` e `CLERK_SECRET_KEY`) são fornecidas dinamicamente no prompt e devem ser usadas.

### 4. Configurar Supabase

1.  **Crie um Projeto Supabase:** Acesse [Supabase](https://supabase.com/) e crie um novo projeto.
2.  **Obtenha as Credenciais:** No painel do seu projeto Supabase, vá em "Settings" > "API" para encontrar sua `Project URL` e `anon public` key. Use a `service_role` key para `SUPABASE_SERVICE_ROLE_KEY` e a `JWT Secret` para `SUPABASE_JWT_SECRET`.
3.  **Execute os Scripts SQL:** Os scripts SQL na pasta `scripts/` são para configurar seu banco de dados. Você pode executá-los manualmente no SQL Editor do Supabase ou usar uma ferramenta de migração.

    *   `000_create_daily_permanence_records_table.sql`
    *   `001_create_attendance_tables.sql`
    *   `002_create_claviculario_tables.sql`
    *   `003_disable_rls_for_tables.sql`
    *   `004_create_events_table.sql`
    *   `005_create_flights_table.sql`
    *   `006_create_personal_notes_table.sql`
    *   `007_disable_rls_for_new_tables.sql`
    *   `008_insert_initial_keys.sql`
    *   `009_create_military_personal_checklist_templates_table.sql`
    *   `010_disable_rls_for_military_personal_checklist_templates.sql`
    *   `011_create_military_personnel_table.sql`

### 5. Rodar a Aplicação

\`\`\`bash
npm run dev
# ou
yarn dev
\`\`\`

A aplicação estará disponível em `http://localhost:3000`.

## Estrutura do Projeto

-   `app/`: Rotas e layouts do Next.js App Router.
-   `components/`: Componentes React reutilizáveis.
    -   `ui/`: Componentes shadcn/ui.
-   `lib/`: Funções utilitárias e de acesso a dados.
-   `hooks/`: Hooks React personalizados.
-   `scripts/`: Scripts SQL para configuração do banco de dados.
-   `public/`: Ativos estáticos.
-   `styles/`: Estilos globais.

## Contribuição

Sinta-se à vontade para contribuir com melhorias e novas funcionalidades.

## Licença

Este projeto está licenciado sob a licença MIT.
