# Variáveis de Ambiente

Este projeto requer as seguintes variáveis de ambiente para funcionar corretamente:

## Supabase Configuration

Crie um arquivo `.env.local` na raiz do projeto com as seguintes variáveis:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://wruvehhfzkvmfyhxzmwo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ

# Service Role Key (for server-side operations)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2bWZ5aHh6bXdvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MzE0NDcxOCwiZXhwIjoyMDY4NzIwNzE4fQ.YNVbhtBHlTGh9q_F3j7Y4DM3OADY8wgLlEDWxCGyfJk
```

## Descrição das Variáveis

- **NEXT_PUBLIC_SUPABASE_URL**: URL do seu projeto Supabase
- **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Chave anônima pública para operações do lado do cliente
- **SUPABASE_SERVICE_ROLE_KEY**: Chave de serviço para operações do lado do servidor com permissões elevadas

## Importante

- O arquivo `.env.local` está no `.gitignore` e não será commitado
- As variáveis com prefixo `NEXT_PUBLIC_` são expostas ao navegador
- A chave de serviço deve ser mantida segura e usada apenas no servidor
