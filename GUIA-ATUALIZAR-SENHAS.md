# 🔐 GUIA PARA ATUALIZAR SENHAS DOS USUÁRIOS

## 📋 **USUÁRIOS PARA ATUALIZAR:**

### **1. permanencia@poker.com**
- **Nova senha:** `poker@2025`

### **2. chamadapoker@gmail.com**
- **Nova senha:** `poker@011052`

## 🚀 **MÉTODO 1: SUPABASE DASHBOARD (Recomendado)**

### **Passo 1: Acessar o Supabase**
1. Vá para: https://supabase.com/dashboard
2. Faça login na sua conta
3. Selecione o projeto: `wruvehhfzkvmfyhxzmwo`

### **Passo 2: Ir para Authentication**
1. No menu lateral esquerdo, clique em **"Authentication"**
2. Clique em **"Users"**

### **Passo 3: Localizar os Usuários**
1. Procure por `permanencia@poker.com`
2. Procure por `chamadapoker@gmail.com`

### **Passo 4: Atualizar Senhas**
Para cada usuário:
1. Clique no usuário na lista
2. Clique no botão **"Reset Password"** ou **"Update User"**
3. Digite a nova senha:
   - **permanencia@poker.com**: `poker@2025`
   - **chamadapoker@gmail.com**: `poker@011052`
4. Clique em **"Save"** ou **"Update"**

## 🛠️ **MÉTODO 2: SQL EDITOR**

### **Passo 1: Abrir SQL Editor**
1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New Query"**

### **Passo 2: Executar Script SQL**
Cole e execute o seguinte script:

```sql
-- =====================================================
-- ATUALIZAR SENHAS DOS USUÁRIOS
-- =====================================================

-- 1. Verificar usuários existentes
SELECT 
  id,
  email,
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email IN ('permanencia@poker.com', 'chamadapoker@gmail.com')
ORDER BY email;

-- 2. Atualizar senha do permanencia@poker.com
UPDATE auth.users 
SET 
  encrypted_password = crypt('poker@2025', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'permanencia@poker.com';

-- 3. Atualizar senha do chamadapoker@gmail.com
UPDATE auth.users 
SET 
  encrypted_password = crypt('poker@011052', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'chamadapoker@gmail.com';

-- 4. Verificar se as atualizações foram realizadas
SELECT 
  id,
  email,
  created_at,
  updated_at,
  last_sign_in_at,
  CASE 
    WHEN encrypted_password IS NOT NULL THEN 'Senha atualizada'
    ELSE 'Sem senha'
  END as password_status
FROM auth.users 
WHERE email IN ('permanencia@poker.com', 'chamadapoker@gmail.com')
ORDER BY email;
```

### **Passo 3: Executar o Script**
1. Clique em **"Run"** para executar
2. Verifique os resultados das consultas
3. Confirme que as senhas foram atualizadas

## 🧪 **MÉTODO 3: TESTE DE LOGIN**

### **Após atualizar as senhas, teste o login:**

#### **Teste 1: permanencia@poker.com**
1. Acesse: http://localhost:3000/login
2. Email: `permanencia@poker.com`
3. Senha: `poker@2025`
4. Clique em "Entrar no Sistema"

#### **Teste 2: chamadapoker@gmail.com**
1. Acesse: http://localhost:3000/login
2. Email: `chamadapoker@gmail.com`
3. Senha: `poker@011052`
4. Clique em "Entrar no Sistema"

## ✅ **VERIFICAÇÃO FINAL**

### **Confirme que:**
- ✅ Login funciona com as novas senhas
- ✅ Usuários são redirecionados corretamente
- ✅ Perfis são carregados adequadamente
- ✅ Menu lateral aparece conforme o role
- ✅ Funcionalidades estão acessíveis

## 🚨 **PROBLEMAS COMUNS E SOLUÇÕES**

### **Problema 1: "Invalid login credentials"**
- **Solução:** Verifique se a senha foi atualizada corretamente
- **Verificação:** Execute a consulta SQL de verificação

### **Problema 2: "User not found"**
- **Solução:** Verifique se o email está correto
- **Verificação:** Execute a consulta de usuários existentes

### **Problema 3: "Password too weak"**
- **Solução:** As senhas `poker@2025` e `poker@011052` atendem aos critérios
- **Verificação:** Senhas têm pelo menos 8 caracteres com números e símbolos

## 📞 **SUPORTE**

Se houver problemas:
1. Verifique os logs no console do navegador
2. Confirme que as senhas foram atualizadas no Supabase
3. Teste o login em modo incógnito
4. Verifique se não há cache do navegador interferindo

## 🎯 **RESULTADO ESPERADO**

Após seguir este guia:
- ✅ **permanencia@poker.com** com senha `poker@2025`
- ✅ **chamadapoker@gmail.com** com senha `poker@011052`
- ✅ Login funcionando perfeitamente
- ✅ Sistema operacional com as novas credenciais
