# 🔧 Solução para Problemas das Justificativas

## 🚨 **Problemas Identificados:**

### **1. Duplicação do Posto no Dropdown:**
- ❌ **Problema:** Dropdown mostrando "TC CARNEIRO" duas vezes
- ✅ **Solução:** Verificar se não há dados duplicados em `militaryPersonnel`

### **2. Erro ao Salvar:**
- ❌ **Problema:** `Erro ao salvar justificativa: {}`
- ✅ **Solução:** Melhorado tratamento de erros e debug

## 🧪 **Passos para Resolver:**

### **Passo 1: Verificar Console do Navegador**
1. **Abra F12** → Console
2. **Tente criar uma justificativa**
3. **Verifique as mensagens de debug:**
   - "Tentando salvar justificativa: [dados]"
   - "Erro Supabase (insert): [erro]"
   - "Erro completo ao salvar justificativa: [erro]"

### **Passo 2: Verificar Tabela no Supabase**
**Execute este script no SQL Editor do Supabase:**

```sql
-- Verificar se a tabela existe
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'military_justifications';

-- Verificar estrutura da tabela
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'military_justifications';
```

### **Passo 3: Se a Tabela Estiver Incorreta**
**Execute este script para recriar:**

```sql
-- Remover tabela existente
DROP TABLE IF EXISTS military_justifications CASCADE;

-- Criar tabela com estrutura correta
CREATE TABLE military_justifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    military_id TEXT NOT NULL,
    military_name TEXT NOT NULL,
    reason TEXT NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar índices para melhor performance
CREATE INDEX idx_military_justifications_military_id ON military_justifications(military_id);
CREATE INDEX idx_military_justifications_date_range ON military_justifications(start_date, end_date);
CREATE INDEX idx_military_justifications_created_at ON military_justifications(created_at);
```

### **Passo 4: Verificar Permissões**
**Execute este script para verificar permissões:**

```sql
-- Verificar permissões da tabela
SELECT grantee, privilege_type, is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'military_justifications';

-- Verificar políticas RLS
SELECT policyname, permissive, cmd, qual
FROM pg_policies 
WHERE tablename = 'military_justifications';
```

## 🔍 **Debug Melhorado:**

### **Console Logs Adicionados:**
- ✅ **Erro Supabase (insert/update):** Mostra erro específico do Supabase
- ✅ **Erro completo:** Mostra todos os detalhes do erro
- ✅ **Tipo do erro:** String, Object, etc.
- ✅ **Mensagem do erro:** Texto da mensagem
- ✅ **Código do erro:** Código de erro do Supabase
- ✅ **Detalhes do erro:** Informações adicionais

### **Tratamento de Erros:**
- ✅ **Mensagens específicas** baseadas no tipo de erro
- ✅ **Fallback** para mensagens genéricas
- ✅ **Toast notifications** com informações úteis

## 🎯 **Teste Após Correção:**

### **1. Criar Justificativa:**
- Selecione um militar
- Defina as datas
- Digite o motivo: "FERIAS"
- Clique em "Criar"

### **2. Verificar Console:**
- Deve aparecer "Tentando salvar justificativa: [dados]"
- Se der erro, deve mostrar detalhes completos

### **3. Verificar Supabase:**
- Acesse Table Editor
- Verifique se o registro foi criado em `military_justifications`

## 🚀 **Se Ainda Não Funcionar:**

### **1. Verificar Variáveis de Ambiente:**
```bash
# .env.local deve conter:
NEXT_PUBLIC_SUPABASE_URL=https://wruvehhfzkvmfyhxzmwo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### **2. Verificar Conectividade:**
- Teste a página `/test-supabase`
- Verifique se consegue conectar ao Supabase

### **3. Verificar Políticas RLS:**
- Se houver RLS ativo, pode estar bloqueando inserções
- Desative temporariamente para teste

---

**🎯 Execute os passos na ordem e me informe o resultado!**
