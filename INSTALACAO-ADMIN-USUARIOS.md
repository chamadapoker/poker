# 🔐 INSTALAÇÃO - SISTEMA DE ADMINISTRAÇÃO DE USUÁRIOS

## 📋 **PRÉ-REQUISITOS**
- ✅ Sistema POKER 360 instalado e funcionando
- ✅ Usuário com role "admin" no Supabase
- ✅ Acesso ao painel do Supabase
- ✅ Node.js e npm instalados

---

## 🚀 **PASSO A PASSO DE INSTALAÇÃO**

### **1. Executar Script SQL no Supabase:**
1. Acesse o painel do Supabase
2. Vá em **"SQL Editor"**
3. Execute o arquivo: `scripts/setup-admin-permissions.sql`
4. Aguarde a confirmação de sucesso

### **2. Verificar Instalação:**
1. Acesse o sistema POKER 360
2. Faça login com usuário admin
3. Vá para a página **"Administração"** no menu
4. Verifique se a lista de usuários carrega

---

## 🎯 **COMO USAR O SISTEMA**

### **A) Acessar a Administração:**
1. Faça login no sistema
2. No menu lateral, clique em **"Administração"**
3. Apenas usuários com role "admin" podem acessar

### **B) Gerenciar Usuários:**

#### **1. Listar Usuários:**
- ✅ Visualize todos os usuários cadastrados
- ✅ Veja status de verificação de email
- ✅ Veja data de criação e último acesso

#### **2. Alterar Senha:**
- ✅ Clique em **"Alterar Senha"** ao lado do usuário
- ✅ Digite a nova senha
- ✅ Clique em **"Alterar Senha"**
- ✅ A senha será alterada imediatamente

#### **3. Verificar Email:**
- ✅ Para usuários com email não verificado
- ✅ Clique em **"Verificar Email"**
- ✅ O email será marcado como verificado

#### **4. Alterar Email:**
- ✅ Clique em **"Alterar Email"** ao lado do usuário
- ✅ Digite o novo email
- ✅ Clique em **"Alterar Email"**
- ✅ O email será alterado imediatamente

---

## 🔧 **CONFIGURAÇÕES AVANÇADAS**

### **A) Via Interface Web do Supabase:**
1. Acesse [supabase.com](https://supabase.com)
2. Vá em **"Authentication" > "Users"**
3. Gerencie usuários diretamente no painel

### **B) Via SQL (Apenas para Desenvolvedores):**
```sql
-- Listar usuários
SELECT * FROM admin_users_view;

-- Ver estatísticas
SELECT * FROM get_user_stats();

-- Ver logs de auditoria
SELECT * FROM get_audit_logs(100);
```

---

## 🛠️ **TROUBLESHOOTING**

### **A) Problemas Comuns:**

#### **1. "Acesso negado" ao tentar acessar /admin:**
- ✅ Verifique se o usuário tem role "admin"
- ✅ Verifique se o script SQL foi executado
- ✅ Faça logout e login novamente

#### **2. Lista de usuários não carrega:**
- ✅ Verifique se as funções SQL foram criadas
- ✅ Verifique se o usuário é admin
- ✅ Verifique os logs do console do navegador

#### **3. Erro ao alterar senha:**
- ✅ Verifique se a senha tem pelo menos 6 caracteres
- ✅ Verifique se o usuário existe
- ✅ Verifique se há permissões adequadas

### **B) Logs de Debug:**
```javascript
// No console do navegador, verifique:
console.log('Usuário atual:', user);
console.log('Perfil:', profile);
console.log('Role:', profile?.role);
```

---

## 📊 **FUNCIONALIDADES DISPONÍVEIS**

### **✅ Interface Web:**
- Listar todos os usuários
- Alterar senhas
- Verificar emails
- Alterar emails
- Ver estatísticas básicas

### **✅ Funções SQL:**
- `is_admin(user_id)` - Verificar se é admin
- `get_users_list()` - Listar usuários
- `update_user_password()` - Alterar senha
- `verify_user_email()` - Verificar email
- `get_user_stats()` - Estatísticas
- `get_audit_logs()` - Logs de auditoria

### **✅ Views:**
- `admin_users_view` - View completa de usuários

---

## 🔒 **SEGURANÇA**

### **A) Permissões:**
- ✅ Apenas usuários com role "admin" podem acessar
- ✅ Todas as funções verificam permissões
- ✅ RLS configurado corretamente

### **B) Validações:**
- ✅ Senhas devem ter pelo menos 6 caracteres
- ✅ Emails devem ser válidos
- ✅ Usuários devem existir antes de alterar

### **C) Logs:**
- ✅ Todas as ações são logadas
- ✅ Logs de auditoria disponíveis
- ✅ Rastreamento de alterações

---

## 📞 **SUPORTE**

### **A) Documentação:**
- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Supabase Admin API](https://supabase.com/docs/guides/auth/admin-api)

### **B) Comandos Úteis:**
```bash
# Verificar status do sistema
npm run build

# Verificar erros
npm run lint

# Testar em desenvolvimento
npm run dev
```

---

## ✅ **CHECKLIST DE VERIFICAÇÃO**

- [ ] Script SQL executado com sucesso
- [ ] Usuário admin pode acessar /admin
- [ ] Lista de usuários carrega corretamente
- [ ] Alteração de senha funciona
- [ ] Verificação de email funciona
- [ ] Alteração de email funciona
- [ ] Logs de auditoria funcionam
- [ ] Sistema está seguro e funcional

---

**🎯 Sistema de administração de usuários instalado e pronto para uso!**
