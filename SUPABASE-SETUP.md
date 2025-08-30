# 🚀 Configuração do Supabase - Sistema POKER 360

## 📋 Pré-requisitos

1. **Projeto Supabase ativo** com as credenciais configuradas
2. **Arquivo `.env.local`** criado com as variáveis corretas
3. **Acesso ao SQL Editor** do Supabase

## 🔧 Passos para Configuração

### 1. Acessar o Supabase Dashboard

- Vá para [https://supabase.com/dashboard](https://supabase.com/dashboard)
- Faça login e acesse seu projeto `wruvehhfzkvmfyhxzmwo`

### 2. Executar o Script SQL

- No dashboard, vá para **SQL Editor**
- Clique em **New Query**
- Cole todo o conteúdo do arquivo `database-setup.sql`
- Clique em **Run** para executar

### 3. Verificar as Tabelas Criadas

Após executar o script, você deve ver:

```
✅ military_attendance_records
✅ military_justifications  
✅ military_personnel
```

### 4. Verificar os Dados de Exemplo

- Vá para **Table Editor**
- Verifique se as tabelas foram criadas
- Confirme se há dados de exemplo inseridos

## 🧪 Testando a Integração

### 1. Acessar a Página de Teste

- Inicie o servidor: `npm run dev`
- Acesse: `http://localhost:3000/test-supabase`

### 2. Verificar o Status

A página deve mostrar:
- ✅ **Conectado com sucesso!**
- 📊 **Tabelas disponíveis** listadas
- 📋 **Dados de exemplo** carregados
- 🔧 **Botões de teste** funcionando

### 3. Testar Operações

- **Testar Inserção**: Cria um registro de teste
- **Testar Exclusão**: Remove o registro de teste
- **Verificar Dados**: Confirma se os dados estão sendo atualizados

## 🚨 Solução de Problemas

### Erro: "relation does not exist"

**Causa**: Tabelas não foram criadas
**Solução**: Execute o script SQL novamente

### Erro: "permission denied"

**Causa**: Políticas RLS muito restritivas
**Solução**: Verifique se as políticas foram criadas corretamente

### Erro: "invalid input syntax"

**Causa**: Formato de data incorreto
**Solução**: Verifique se o formato de data está correto (YYYY-MM-DD)

### Erro: "connection failed"

**Causa**: Variáveis de ambiente incorretas
**Solução**: Verifique o arquivo `.env.local`

## 📊 Estrutura das Tabelas

### `military_attendance_records`
- Registros de presença militar
- Campos: id, military_id, military_name, rank, call_type, date, status

### `military_justifications`
- Justificativas de ausência
- Campos: id, military_id, military_name, type, reason, start_date, end_date, approved

### `military_personnel`
- Cadastro de pessoal
- Campos: id, military_id, name, rank, squadron, role, email, phone_number

## 🔐 Segurança

- **RLS habilitado** em todas as tabelas
- **Políticas públicas** para desenvolvimento
- **Índices** para melhor performance
- **Triggers** para atualização automática de timestamps

## 📝 Próximos Passos

Após a configuração bem-sucedida:

1. **Teste a página de presença** (`/attendance`)
2. **Verifique se os dados estão sendo carregados**
3. **Teste o sistema de justificativas**
4. **Confirme se as operações CRUD estão funcionando**

## 🆘 Suporte

Se encontrar problemas:

1. Verifique o **console do navegador** para erros
2. Confirme as **credenciais do Supabase**
3. Execute o **script SQL** novamente
4. Verifique as **políticas RLS** no dashboard

---

**🎯 Sistema POKER 360 - Integração Supabase Completa!**
