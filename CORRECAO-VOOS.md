# Correção dos Problemas de Agendamento de Voos

## Problemas Identificados

1. **Nomes invisíveis no dropdown**: Os nomes dos militares ficavam invisíveis no modo dark
2. **Erro de coluna `flight_time`**: A tabela `flight_schedules` não tinha a coluna `flight_time`

## Soluções Implementadas

### 1. Correção Visual (Dropdown)

✅ **Problema resolvido**: Os nomes dos militares agora são visíveis no modo dark
- Adicionadas classes CSS para modo dark no `SelectContent` e `SelectItem`
- Melhorado contraste de cores para texto e fundo
- Corrigida visibilidade dos militares já selecionados

### 2. Correção da Estrutura do Banco

✅ **Script criado**: `scripts/fix-flight-schedules-table.sql`

Este script:
- Verifica se a tabela `flight_schedules` existe
- Adiciona a coluna `flight_time` se ela não existir
- Adiciona a coluna `military_ids` se ela não existir
- Cria triggers e permissões necessárias
- Mostra a estrutura final da tabela

## Como Executar a Correção

### Opção 1: Via Supabase Dashboard

1. Acesse o [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá para o seu projeto
3. Clique em "SQL Editor"
4. Cole o conteúdo do arquivo `scripts/fix-flight-schedules-table.sql`
5. Execute o script

### Opção 2: Via psql (se tiver acesso direto)

```bash
psql -h [SEU_HOST] -U [SEU_USUARIO] -d [SEU_BANCO] -f scripts/fix-flight-schedules-table.sql
```

### Opção 3: Via Supabase CLI

```bash
supabase db reset
# ou
supabase db push
```

## Verificação

Após executar o script, você deve ver:

1. **No console**: Mensagens de sucesso indicando que as colunas foram criadas
2. **Na aplicação**: O agendamento de voos funcionando sem erros
3. **No dropdown**: Nomes dos militares visíveis no modo dark

## Estrutura Esperada da Tabela

Após a correção, a tabela `flight_schedules` deve ter:

```sql
- id (UUID, PRIMARY KEY)
- flight_date (DATE, NOT NULL)
- flight_time (TIME, NOT NULL)  ← Esta coluna será adicionada
- military_ids (TEXT, NOT NULL) ← Esta coluna será adicionada
- created_at (TIMESTAMP WITH TIME ZONE)
- updated_at (TIMESTAMP WITH TIME ZONE)
```

## Teste

Após executar o script:

1. Acesse a página de Agendamento de Voos
2. Tente criar um novo voo
3. Verifique se os nomes dos militares são visíveis no dropdown
4. Confirme se o voo é salvo sem erros

## Logs Esperados

No console do navegador, você deve ver:
- ✅ "Voos carregados com sucesso"
- ✅ "Voo agendado com sucesso" (sem erros de coluna)

Se ainda houver problemas, verifique:
1. Se o script foi executado com sucesso
2. Se as permissões estão corretas
3. Se o cache do Supabase foi limpo
