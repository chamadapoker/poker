-- =====================================================
-- SCRIPT PARA CRIAR TABELA DE PERFIS DE USUÁRIO
-- =====================================================
-- Este script cria a tabela user_profiles para controle de acesso
-- baseado em roles (admin/user)

-- 1. CRIAR TABELA USER_PROFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    display_name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- 2. CRIAR ÍNDICES PARA PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- 3. HABILITAR RLS (ROW LEVEL SECURITY)
-- =====================================================
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 4. CRIAR POLÍTICAS DE SEGURANÇA
-- =====================================================
-- Usuários podem ler seu próprio perfil
CREATE POLICY "users_can_read_own_profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

-- Usuários podem atualizar seu próprio perfil
CREATE POLICY "users_can_update_own_profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Usuários autenticados podem inserir perfis
CREATE POLICY "authenticated_users_can_insert_profiles" ON user_profiles
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 5. CRIAR TRIGGER PARA ATUALIZAR UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_user_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_user_profiles_updated_at();

-- 6. INSERIR PERFIS INICIAIS (se não existirem)
-- =====================================================
-- Perfil para pokeradmin@teste.com (ADMIN)
INSERT INTO user_profiles (user_id, role, display_name)
SELECT 
    au.id,
    'admin',
    'Administrador'
FROM auth.users au
WHERE au.email = 'pokeradmin@teste.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.user_id = au.id
);

-- Perfil para poker@teste.com (USER)
INSERT INTO user_profiles (user_id, role, display_name)
SELECT 
    au.id,
    'user',
    'Usuário'
FROM auth.users au
WHERE au.email = 'poker@teste.com'
AND NOT EXISTS (
    SELECT 1 FROM user_profiles up WHERE up.user_id = au.id
);

-- 7. VERIFICAR ESTRUTURA CRIADA
-- =====================================================
-- Verificar se a tabela foi criada
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'user_profiles'
ORDER BY ordinal_position;

-- Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'user_profiles'
ORDER BY policyname;

-- Verificar dados inseridos
SELECT 
    up.id,
    up.user_id,
    up.role,
    up.display_name,
    up.created_at,
    au.email
FROM user_profiles up
JOIN auth.users au ON up.user_id = au.id
ORDER BY up.role, up.created_at;
