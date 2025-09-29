# Poker 360 - Sistema de Gestão Militar

Sistema completo de gestão para unidades militares, incluindo controle de presença, gestão de chaves, agendamento de voos, histórico de atividades e muito mais.

## 🚀 Funcionalidades

- **Controle de Presença**: Registro de entrada/saída e eventos
- **Gestão de Chaves**: Controle completo do claviculário
- **Agendamento de Voo**: Sistema de agendamento de voos
- **Histórico**: Registro detalhado de todas as atividades
- **Checklist de Permanência**: Controle de permanência militar
- **Justificativas**: Gestão de justificativas de ausência
- **Calendário de Eventos**: Visualização de eventos
- **Notas Pessoais**: Sistema de anotações pessoais

## 🛠️ Tecnologias

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Deploy**: Vercel
- **Versionamento**: Git/GitHub

## 📦 Instalação

```bash
# Clone o repositório
git clone https://github.com/chamadapoker/poker.git

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute o projeto
npm run dev
```

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```bash
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 🎯 Deploy Automático

O projeto está configurado para deploy automático na Vercel. Qualquer push para a branch `main` dispara um novo deploy automaticamente.

**Status:** ✅ Deploy automático ativo
**Última atualização:** $(date)
**Variáveis configuradas:** ✅ Supabase URL e Anon Key
