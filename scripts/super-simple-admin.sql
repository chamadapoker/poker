-- =====================================================
-- SCRIPT SUPER SIMPLES - APENAS AUTH.USERS
-- Sistema POKER 360 - 1º/10º GAV
-- =====================================================

-- 1. Criar view super simples para listar usuários
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.last_sign_in_at,
    'Usuário' as display_name,
    'user' as role,
    'N/A' as rank,
    'N/A' as squadron
FROM auth.users u;

-- 2. Criar função para obter estatísticas básicas
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE (
    total_users BIGINT,
    verified_users BIGINT,
    unverified_users BIGINT,
    admin_users BIGINT
) AS $$
BEGIN
    -- Retornar estatísticas
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM auth.users) as total_users,
        (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) as verified_users,
        (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NULL) as unverified_users,
        (SELECT COUNT(*) FROM auth.users) as admin_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Configurar permissões
GRANT SELECT ON admin_users_view TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats() TO authenticated;

-- 4. Comentários
COMMENT ON FUNCTION get_user_stats() IS 'Obtém estatísticas básicas de usuários';
COMMENT ON VIEW admin_users_view IS 'View super simples para listar usuários';

-- 5. Teste básico
DO $$
BEGIN
    RAISE NOTICE 'Configuração super simples criada com sucesso!';
    RAISE NOTICE 'Execute: SELECT * FROM admin_users_view; para testar';
    RAISE NOTICE 'Execute: SELECT * FROM get_user_stats(); para ver estatísticas';
    RAISE NOTICE 'NOTA: Este script funciona apenas com dados básicos de usuários';
    RAISE NOTICE 'NOTA: Sem verificação de permissões por enquanto';
END $$;
