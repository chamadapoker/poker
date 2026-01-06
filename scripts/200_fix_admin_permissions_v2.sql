-- =====================================================
-- SCRIPT DE CORREÇÃO DE PERMISSÕES V2
-- CORRIGE O CRÍTICO MISMATCH ENTRE 'PROFILES' E 'USER_PROFILES'
-- =====================================================

-- 1. Garantir que a tabela correta (user_profiles) tenha índices de performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON user_profiles(role);

-- 1.5 Garantir que colunas rank e squadron existam em user_profiles
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS rank TEXT;
ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS squadron TEXT;

-- 2. Redefinir a função is_admin para olhar para a tabela CORRETA (user_profiles)
-- Antigamente olhava para 'profiles' que não é usada pelo frontend
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_id = is_admin.user_id 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Sobrecarga para facilitar chamadas sem argumento (usa o usuário atual)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN is_admin(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Corrigir View de Usuários para usar user_profiles
DROP VIEW IF EXISTS admin_users_view;
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.last_sign_in_at,
    u.raw_user_meta_data as user_metadata,
    p.display_name,
    p.role,
    p."rank", -- Quote rank to avoid reserved word conflict
    p.squadron
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE is_admin(auth.uid()); -- Garante que só admins vejam

-- Permite que RLS seja aplicado corretamente
ALTER VIEW admin_users_view OWNER TO postgres;

-- 4. Corrigir RPC de Estatísticas
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE (
    total_users BIGINT,
    verified_users BIGINT,
    unverified_users BIGINT,
    admin_users BIGINT -- Novo campo útil
) AS $$
BEGIN
    -- Verificar se o usuário atual é admin usando a nova função corrigida
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Acesso negado. Apenas administradores podem ver estatísticas.';
    END IF;
    
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM auth.users) as total_users,
        (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) as verified_users,
        (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NULL) as unverified_users,
        (SELECT COUNT(*) FROM user_profiles WHERE role = 'admin') as admin_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Função auxiliar para garantir que o primeiro usuário seja admin (failsafe)
DO $$
DECLARE
    target_email TEXT := 'pokeradmin@teste.com'; -- Email do admin padrão
    user_record RECORD;
BEGIN
    SELECT * INTO user_record FROM auth.users WHERE email = target_email;
    
    IF FOUND THEN
        -- Se o registro em user_profiles não existir, cria
        INSERT INTO user_profiles (user_id, role, display_name, rank, squadron)
        VALUES (user_record.id, 'admin', 'Administrador', 'Cel', '1º/10º GAV')
        ON CONFLICT (user_id) 
        DO UPDATE SET role = 'admin'; -- Garante que é admin
        
        RAISE NOTICE 'Usuário % garantido como admin em user_profiles.', target_email;
    END IF;
END $$;

-- 6. Garantia de RLS em user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users_can_read_own_profile" ON user_profiles;
CREATE POLICY "users_can_read_own_profile" ON user_profiles
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "admins_can_read_all_profiles" ON user_profiles;
CREATE POLICY "admins_can_read_all_profiles" ON user_profiles
    FOR SELECT USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admins_can_update_all_profiles" ON user_profiles;
CREATE POLICY "admins_can_update_all_profiles" ON user_profiles
    FOR UPDATE USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "admins_can_delete_profiles" ON user_profiles;
CREATE POLICY "admins_can_delete_profiles" ON user_profiles
    FOR DELETE USING (is_admin(auth.uid()));

DROP POLICY IF EXISTS "users_can_update_own_profile" ON user_profiles;
CREATE POLICY "users_can_update_own_profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- Confirmação
DO $$
BEGIN
    RAISE NOTICE 'Correção de permissões aplicada com sucesso.';
    RAISE NOTICE 'Função is_admin agora aponta para user_profiles.';
    RAISE NOTICE 'View admin_users_view reconstruída com user_profiles.';
END $$;
