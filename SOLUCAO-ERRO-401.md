# 🔧 SOLUÇÃO PARA ERRO 401 - SUPABASE

## ❌ **Problema Identificado:**
- Erro 401 (Unauthorized) ao tentar acessar a tabela `military_justifications`
- As justificativas existem no banco mas não aparecem no site
- Problema de permissões RLS (Row Level Security)

## 🛠️ **Soluções:**

### **Opção 1: Executar Script SQL no Supabase (Recomendado)**

1. **Acesse o Supabase Dashboard:**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto: `wruvehhfzkvmfyhxzmwo`

2. **Abra o SQL Editor:**
   - Clique em "SQL Editor" no menu lateral
   - Clique em "New query"

3. **Execute o script de correção:**
   - Copie e cole o conteúdo do arquivo `scripts/fix-rls-public-access.sql`
   - Clique em "Run" para executar

4. **Verifique o resultado:**
   - O script deve mostrar o status das correções
   - Deve exibir o número de justificativas encontradas

### **Opção 2: Correção Manual via Dashboard**

1. **Vá para Authentication > Policies:**
   - Menu lateral → Authentication → Policies

2. **Localize a tabela `military_justifications`:**
   - Clique na tabela para ver as políticas existentes

3. **Remova políticas restritivas:**
   - Delete todas as políticas existentes
   - Crie uma nova política com permissão total

4. **Nova política:**
   ```sql
   CREATE POLICY "public_access" ON military_justifications
   FOR ALL USING (true) WITH CHECK (true);
   ```

### **Opção 3: Desabilitar RLS Temporariamente**

1. **SQL Editor:**
   ```sql
   -- Desabilitar RLS para a tabela
   ALTER TABLE military_justifications DISABLE ROW LEVEL SECURITY;
   
   -- Verificar dados
   SELECT COUNT(*) FROM military_justifications;
   SELECT * FROM military_justifications LIMIT 5;
   ```

## 🔍 **Verificação:**

### **1. Teste no Console do Navegador:**
- Abra a página de justificativas
- Pressione F12 → Console
- Execute o teste do componente SupabaseTest
- Verifique os logs detalhados

### **2. Verificar Variáveis de Ambiente:**
- Confirme que `.env.local` está na raiz do projeto
- Verifique se as chaves estão corretas
- Reinicie o servidor após alterações

### **3. Testar Conexão Direta:**
```javascript
// No console do navegador
const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  'https://wruvehhfzkvmfyhxzmwo.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndydXZlaGhmemt2WZ5aHh6bXdvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMxNDQ3MTgsImV4cCI6MjA2ODcyMDcxOH0.PNEZuvz_YlDixkTwFjVgERsOQdVghb3iwcCQLee9DYQ'
)

// Testar conexão
supabase.from('military_justifications').select('*').then(console.log)
```

## 📋 **Estrutura Esperada da Tabela:**

```sql
CREATE TABLE military_justifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    military_id TEXT NOT NULL,
    military_name TEXT NOT NULL,
    reason TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 🚨 **Problemas Comuns:**

1. **RLS habilitado sem políticas adequadas**
2. **Políticas restritivas bloqueando acesso anônimo**
3. **Tabela em schema incorreto**
4. **Permissões de usuário insuficientes**
5. **Triggers ou constraints interferindo**

## ✅ **Após a Correção:**

1. **Recarregue a página** de justificativas
2. **Execute o teste** do componente SupabaseTest
3. **Verifique o console** para logs de sucesso
4. **Confirme** que as justificativas aparecem na lista

## 📞 **Se o Problema Persistir:**

1. **Verifique os logs** do Supabase Dashboard
2. **Teste a conexão** com outras tabelas
3. **Confirme as credenciais** do projeto
4. **Verifique se há** problemas de rede ou firewall

---

**🎯 Objetivo:** Permitir acesso público à tabela `military_justifications` para que as justificativas apareçam no site.
