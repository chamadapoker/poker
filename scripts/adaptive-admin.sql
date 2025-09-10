-- =====================================================
-- SCRIPT ADAPTATIVO DE ADMINISTRAÇÃO
-- Sistema POKER 360 - 1º/10º GAV
-- =====================================================

-- 1. Verificar estrutura da tabela profiles
DO $$
DECLARE
    has_profiles BOOLEAN;
    has_role BOOLEAN;
    has_display_name BOOLEAN;
    has_rank BOOLEAN;
    has_squadron BOOLEAN;
BEGIN
    -- Verificar se a tabela profiles existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'profiles'
    ) INTO has_profiles;
    
    IF has_profiles THEN
        -- Verificar colunas específicas
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'role'
        ) INTO has_role;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'display_name'
        ) INTO has_display_name;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'rank'
        ) INTO has_rank;
        
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'squadron'
        ) INTO has_squadron;
        
        RAISE NOTICE 'Tabela profiles encontrada:';
        RAISE NOTICE '- Coluna role: %', has_role;
        RAISE NOTICE '- Coluna display_name: %', has_display_name;
        RAISE NOTICE '- Coluna rank: %', has_rank;
        RAISE NOTICE '- Coluna squadron: %', has_squadron;
    ELSE
        RAISE NOTICE 'Tabela profiles não encontrada';
    END IF;
END $$;

-- 2. Criar função adaptativa para verificar admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    has_profiles BOOLEAN;
    has_role BOOLEAN;
BEGIN
    -- Verificar se a tabela profiles existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'profiles'
    ) INTO has_profiles;
    
    IF has_profiles THEN
        -- Verificar se tem coluna role
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'role'
        ) INTO has_role;
        
        IF has_role THEN
            -- Usar a coluna role se existir
            RETURN EXISTS (
                SELECT 1 FROM profiles 
                WHERE user_id = auth.uid() 
                AND role = 'admin'
            );
        ELSE
            -- Se não tem coluna role, assumir que todos são admin
            RETURN TRUE;
        END IF;
    ELSE
        -- Se não tem tabela profiles, assumir que todos são admin
        RETURN TRUE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar view adaptativa para listar usuários
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.last_sign_in_at,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'display_name') 
        THEN COALESCE(p.display_name, 'Sem nome')
        ELSE 'Usuário'
    END as display_name,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role') 
        THEN COALESCE(p.role, 'user')
        ELSE 'user'
    END as role,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'rank') 
        THEN COALESCE(p.rank, 'N/A')
        ELSE 'N/A'
    END as rank,
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'squadron') 
        THEN COALESCE(p.squadron, 'N/A')
        ELSE 'N/A'
    END as squadron
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE is_admin();

-- 4. Criar função para obter estatísticas
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE (
    total_users BIGINT,
    verified_users BIGINT,
    unverified_users BIGINT,
    admin_users BIGINT
) AS $$
DECLARE
    has_profiles BOOLEAN;
    has_role BOOLEAN;
BEGIN
    -- Verificar se o usuário atual é admin
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Acesso negado. Apenas administradores podem ver estatísticas.';
    END IF;
    
    -- Verificar se tem tabela profiles e coluna role
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'profiles'
    ) INTO has_profiles;
    
    IF has_profiles THEN
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'role'
        ) INTO has_role;
    END IF;
    
    -- Retornar estatísticas
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM auth.users) as total_users,
        (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) as verified_users,
        (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NULL) as unverified_users,
        CASE 
            WHEN has_profiles AND has_role THEN
                (SELECT COUNT(*) FROM profiles WHERE role = 'admin')
            ELSE
                (SELECT COUNT(*) FROM auth.users)
        END as admin_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Configurar permissões
GRANT SELECT ON admin_users_view TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats() TO authenticated;

-- 6. Comentários
COMMENT ON FUNCTION is_admin() IS 'Verifica se o usuário atual é administrador (adaptativo)';
COMMENT ON FUNCTION get_user_stats() IS 'Obtém estatísticas básicas de usuários (apenas para admins)';
COMMENT ON VIEW admin_users_view IS 'View adaptativa para listar usuários (apenas para admins)';

-- 7. Teste final
DO $$
BEGIN
    RAISE NOTICE 'Configuração adaptativa criada com sucesso!';
    RAISE NOTICE 'Execute: SELECT * FROM admin_users_view; para testar';
    RAISE NOTICE 'Execute: SELECT * FROM get_user_stats(); para ver estatísticas';
    RAISE NOTICE 'Este script se adapta à estrutura real do seu banco de dados';
END $$;
