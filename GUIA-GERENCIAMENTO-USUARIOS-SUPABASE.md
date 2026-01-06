# 🔐 GUIA COMPLETO - GERENCIAMENTO DE USUÁRIOS NO SUPABASE

## 📋 **ÍNDICE**
1. [Interface Web do Supabase](#interface-web)
2. [Código de Administração](#codigo-administracao)
3. [Comandos SQL Diretos](#comandos-sql)
4. [Troubleshooting](#troubleshooting)

---

## 🌐 **1. INTERFACE WEB DO SUPABASE**

### **A) Acessar o Painel de Usuários:**
1. Acesse [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Selecione seu projeto
4. No menu lateral, clique em **"Authentication"**
5. Clique na aba **"Users"**

### **B) Trocar Senha de um Usuário:**
1. Na lista de usuários, encontre o usuário desejado
2. Clique no **ícone de 3 pontos** (⋮) ao lado do usuário
3. Selecione **"Reset Password"**
4. O Supabase enviará um email de redefinição para o usuário
5. O usuário clicará no link e definirá uma nova senha

### **C) Validar Email de um Usuário:**
1. Na lista de usuários, encontre o usuário
2. Clique no **ícone de 3 pontos** (⋮)
3. Selecione **"Send Email Verification"**
4. O usuário receberá um email de verificação
5. Após clicar no link, o email será validado

### **D) Editar Usuário Manualmente:**
1. Clique no **nome do usuário** na lista
2. Na página de detalhes, você pode:
   - Alterar o email
   - Alterar a senha diretamente
   - Marcar/desmarcar email como verificado
   - Alterar metadados do usuário

---

## 💻 **2. CÓDIGO DE ADMINISTRAÇÃO**

### **A) Componente Criado:**
- **Arquivo**: `components/admin-user-management.tsx`
- **Página**: `app/(authenticated)/admin/page.tsx`
- **Acesso**: `/admin` (após login)

### **B) Funcionalidades do Código:**
- ✅ **Listar todos os usuários**
- ✅ **Alterar senha de usuários**
- ✅ **Verificar emails manualmente**
- ✅ **Alterar emails de usuários**
- ✅ **Ver status de verificação**
- ✅ **Ver data de criação e último acesso**

### **C) Como Usar:**
1. Acesse a página `/admin` no sistema
2. Visualize todos os usuários cadastrados
3. Use os botões para:
   - **Alterar Senha**: Clique em "Alterar Senha" e digite a nova senha
   - **Verificar Email**: Clique em "Verificar Email" para marcar como verificado
   - **Alterar Email**: Clique em "Alterar Email" e digite o novo email

---

## 🗄️ **3. COMANDOS SQL DIRETOS**

### **A) Conectar ao Supabase:**
1. Acesse o painel do Supabase
2. Vá em **"SQL Editor"**
3. Execute os comandos abaixo:

### **B) Consultar Usuários:**
```sql
-- Listar todos os usuários
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at,
  last_sign_in_at,
  user_metadata
FROM auth.users
ORDER BY created_at DESC;
```

### **C) Verificar Status de Email:**
```sql
-- Usuários com email não verificado
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
WHERE email_confirmed_at IS NULL;
```

### **D) Alterar Senha (NÃO RECOMENDADO):**
```sql
-- ⚠️ ATENÇÃO: Use apenas em emergências
-- A senha deve ser hashada corretamente
UPDATE auth.users 
SET encrypted_password = crypt('nova_senha', gen_salt('bf'))
WHERE email = 'usuario@exemplo.com';
```

---

## 🔧 **4. TROUBLESHOOTING**

### **A) Problemas Comuns:**

#### **1. Usuário não consegue fazer login:**
- ✅ Verifique se o email está correto
- ✅ Verifique se o email foi verificado
- ✅ Teste resetar a senha
- ✅ Verifique se a conta não foi desabilitada

#### **2. Email de verificação não chega:**
- ✅ Verifique a pasta de spam
- ✅ Confirme se o email está correto
- ✅ Reenvie o email de verificação
- ✅ Verifique as configurações de SMTP do Supabase

#### **3. Erro de permissão no código:**
- ✅ Verifique se o usuário tem permissão de admin
- ✅ Confirme se as chaves do Supabase estão corretas
- ✅ Verifique se o RLS está configurado corretamente

### **B) Logs e Debug:**
```sql
-- Ver logs de autenticação
SELECT 
  id,
  user_id,
  event_type,
  created_at,
  metadata
FROM auth.audit_log_entries
WHERE user_id = 'ID_DO_USUARIO'
ORDER BY created_at DESC
LIMIT 10;
```

### **C) Verificar Configurações:**
```sql
-- Verificar configurações de autenticação
SELECT * FROM auth.config;
```

---

## 🚀 **5. COMANDOS RÁPIDOS**

### **A) Resetar Senha de Todos os Usuários:**
```sql
-- ⚠️ CUIDADO: Isso desabilitará todos os usuários
UPDATE auth.users 
SET encrypted_password = NULL
WHERE email_confirmed_at IS NOT NULL;
```

### **B) Verificar Usuários Inativos:**
```sql
-- Usuários que não acessam há mais de 30 dias
SELECT 
  email,
  last_sign_in_at,
  created_at
FROM auth.users
WHERE last_sign_in_at < NOW() - INTERVAL '30 days'
ORDER BY last_sign_in_at ASC;
```

### **C) Limpar Usuários Não Verificados:**
```sql
-- ⚠️ CUIDADO: Remove usuários não verificados
DELETE FROM auth.users 
WHERE email_confirmed_at IS NULL 
AND created_at < NOW() - INTERVAL '7 days';
```

---

## 📞 **6. SUPORTE**

### **A) Documentação Oficial:**
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Admin API](https://supabase.com/docs/guides/auth/admin-api)

### **B) Comandos de Emergência:**
```bash
# Resetar senha via CLI (se configurado)
supabase auth reset-password --email usuario@exemplo.com

# Listar usuários via CLI
supabase auth list-users
```

---

## ✅ **CHECKLIST DE VERIFICAÇÃO**

- [ ] Usuário consegue fazer login
- [ ] Email está verificado
- [ ] Senha foi alterada com sucesso
- [ ] Logs de auditoria estão funcionando
- [ ] Backup dos dados foi feito
- [ ] Testes foram realizados

---

**🎯 Lembre-se: Sempre faça backup antes de fazer alterações em massa!**
