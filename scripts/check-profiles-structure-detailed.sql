-- =====================================================
-- SCRIPT PARA VERIFICAR ESTRUTURA DETALHADA DA TABELA PROFILES
-- Sistema POKER 360 - 1º/10º GAV
-- =====================================================

-- 1. Verificar se a tabela profiles existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'profiles';

-- 2. Verificar estrutura completa da tabela profiles
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'profiles'
ORDER BY ordinal_position;

-- 3. Verificar alguns registros de exemplo da tabela profiles
SELECT * FROM profiles LIMIT 3;

-- 4. Verificar estrutura da tabela auth.users
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'auth'
ORDER BY ordinal_position;

-- 5. Verificar relacionamento entre as tabelas
SELECT 
    u.id as user_id,
    u.email,
    p.*
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LIMIT 3;
