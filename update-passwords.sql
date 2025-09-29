-- =====================================================
-- SCRIPT PARA ATUALIZAR SENHAS DOS USUÁRIOS
-- =====================================================
-- Execute este script no SQL Editor do Supabase Dashboard
-- Data: 2025-01-29

-- 1. VERIFICAR USUÁRIOS EXISTENTES
-- =====================================================
SELECT 
  id,
  email,
  created_at,
  email_confirmed_at,
  last_sign_in_at
FROM auth.users 
WHERE email IN ('permanencia@poker.com', 'chamadapoker@gmail.com')
ORDER BY email;

-- 2. ATUALIZAR SENHA DO USUÁRIO: permanencia@poker.com
-- =====================================================
-- Nova senha: poker@2025
UPDATE auth.users 
SET 
  encrypted_password = crypt('poker@2025', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'permanencia@poker.com';

-- 3. ATUALIZAR SENHA DO USUÁRIO: chamadapoker@gmail.com
-- =====================================================
-- Nova senha: poker@011052
UPDATE auth.users 
SET 
  encrypted_password = crypt('poker@011052', gen_salt('bf')),
  updated_at = NOW()
WHERE email = 'chamadapoker@gmail.com';

-- 4. VERIFICAR SE AS ATUALIZAÇÕES FORAM REALIZADAS
-- =====================================================
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

-- 5. VERIFICAR PERFIS DOS USUÁRIOS
-- =====================================================
SELECT 
  up.id,
  up.user_id,
  up.role,
  up.display_name,
  au.email,
  up.created_at
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
WHERE au.email IN ('permanencia@poker.com', 'chamadapoker@gmail.com')
ORDER BY au.email;

-- =====================================================
-- INSTRUÇÕES DE EXECUÇÃO:
-- =====================================================
-- 1. Acesse o Supabase Dashboard
-- 2. Vá para SQL Editor
-- 3. Cole este script completo
-- 4. Execute o script
-- 5. Verifique os resultados das consultas
-- =====================================================
