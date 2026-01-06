# 🚨 EXECUTAR SCRIPT SQL NO SUPABASE

## ❌ **PROBLEMA IDENTIFICADO:**
A tabela `user_profiles` não existe no banco de dados do Supabase, causando erros de autenticação.

## ✅ **SOLUÇÃO:**
Executar o script SQL para criar a tabela e configurar o sistema de perfis.

## 📋 **PASSO A PASSO:**

### **1. Acessar o Supabase:**
- Vá para [supabase.com](https://supabase.com)
- Faça login na sua conta
- Acesse o projeto do Sistema Militar

### **2. Abrir o SQL Editor:**
- No menu lateral esquerdo, clique em **"SQL Editor"**
- Clique em **"New Query"** para criar uma nova consulta

### **3. Executar o Script:**
- Copie todo o conteúdo do arquivo `scripts/create_user_profiles_table.sql`
- Cole no editor SQL
- Clique em **"Run"** para executar

### **4. Verificar a Execução:**
- O script deve executar sem erros
- Você verá mensagens de confirmação para cada etapa
- A tabela `user_profiles` será criada

## 🔍 **VERIFICAÇÃO:**

### **Após executar o script, verifique:**
1. **Tabela criada**: `user_profiles`
2. **Políticas RLS**: Configuradas corretamente
3. **Perfis iniciais**: Criados automaticamente
4. **Índices**: Criados para performance

### **Comandos de verificação:**
```sql
-- Verificar se a tabela existe
SELECT * FROM user_profiles;

-- Verificar políticas RLS
SELECT * FROM pg_policies WHERE tablename = 'user_profiles';

-- Verificar perfis criados
SELECT up.*, au.email 
FROM user_profiles up 
JOIN auth.users au ON up.user_id = au.id;
```

## 🎯 **RESULTADO ESPERADO:**
- ✅ Tabela `user_profiles` criada
- ✅ Sistema de autenticação funcionando
- ✅ Menu lateral aparecendo
- ✅ Logout funcionando
- ✅ Controle de acesso por roles

## 🚨 **IMPORTANTE:**
- Execute o script **APENAS UMA VEZ**
- Não modifique o script antes de executar
- Em caso de erro, verifique os logs no console do navegador

## 📞 **SUPORTE:**
Se houver problemas após executar o script:
1. Verifique os logs no console do navegador
2. Confirme que a tabela foi criada no Supabase
3. Verifique se as políticas RLS estão ativas

---

**🎯 Execute o script SQL e o sistema funcionará perfeitamente!**
