# Configuração das Variáveis de Ambiente

## ⚠️ IMPORTANTE: Configure as Variáveis de Ambiente

Para que a aplicação funcione corretamente, você precisa criar um arquivo `.env.local` na raiz do projeto.

### Passo 1: Criar o arquivo .env.local

Crie um arquivo chamado `.env.local` na raiz do projeto (mesmo nível do `package.json`).

### Passo 2: Adicionar as variáveis

Adicione o seguinte conteúdo ao arquivo `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://wruvehhfzkvmfyhxzmwo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ

# Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE0NDcxOCwiZXhwIjoyMDY4NzIwNzE4fQ.YNVbhtBHlTGh9q_F3j7Y4DM3OADY8wgLlEDWxCGyfJk
```

### Passo 3: Reiniciar a aplicação

Após criar o arquivo `.env.local`, reinicie a aplicação:

```bash
npm run dev
```

## 🔑 O que cada variável faz:

- **NEXT_PUBLIC_SUPABASE_URL**: URL do seu projeto Supabase
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Chave anônima para operações do cliente
- **SUPABASE_SERVICE_ROLE_KEY**: Chave de serviço para operações do servidor

## ✅ Verificação

Se tudo estiver configurado corretamente:

1. A página de eventos deve carregar sem erros
2. O checklist de permanência deve funcionar
3. Todas as funcionalidades devem estar operacionais

## 🚨 Problemas Comuns

### Erro: "supabaseKey is required"
- **Solução**: Verifique se o arquivo `.env.local` foi criado corretamente
- **Verificação**: O arquivo deve estar na raiz do projeto, não em subpastas

### Erro: "Missing Supabase URL or Anon Key"
- **Solução**: Verifique se as variáveis estão escritas exatamente como mostrado acima
- **Verificação**: Não deve haver espaços extras ou caracteres especiais

### Aplicação não reconhece as variáveis
- **Solução**: Reinicie completamente a aplicação após criar o arquivo
- **Comando**: `npm run dev` (pare e execute novamente)

## 📁 Estrutura de Arquivos

```
poker-360-main/
├── .env.local          ← CRIE ESTE ARQUIVO
├── package.json
├── components/
├── lib/
└── app/
```

## 🔒 Segurança

- O arquivo `.env.local` está no `.gitignore` e não será commitado
- As chaves são específicas para o seu projeto
- Não compartilhe essas chaves publicamente
