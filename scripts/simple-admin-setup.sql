-- =====================================================
-- SCRIPT SIMPLES DE CONFIGURAÇÃO ADMINISTRATIVA
-- Sistema POKER 360 - 1º/10º GAV
-- =====================================================

-- 1. Verificar se a tabela profiles existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE EXCEPTION 'Tabela profiles não encontrada. Execute primeiro o script de configuração do banco.';
    END IF;
END $$;

-- 2. Criar função simples para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = auth.uid() 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar view simples para listar usuários (apenas para admins)
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.last_sign_in_at,
    COALESCE(p.display_name, 'Sem nome') as display_name,
    COALESCE(p.role, 'user') as role,
    COALESCE(p.rank, 'N/A') as rank,
    COALESCE(p.squadron, 'N/A') as squadron
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE is_admin();

-- 4. Criar função para obter estatísticas básicas
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE (
    total_users BIGINT,
    verified_users BIGINT,
    unverified_users BIGINT,
    admin_users BIGINT
) AS $$
BEGIN
    -- Verificar se o usuário atual é admin
    IF NOT is_admin() THEN
        RAISE EXCEPTION 'Acesso negado. Apenas administradores podem ver estatísticas.';
    END IF;
    
    -- Retornar estatísticas
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM auth.users) as total_users,
        (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) as verified_users,
        (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NULL) as unverified_users,
        (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as admin_users;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Configurar permissões para a view
GRANT SELECT ON admin_users_view TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats() TO authenticated;

-- 6. Comentários
COMMENT ON FUNCTION is_admin() IS 'Verifica se o usuário atual é administrador';
COMMENT ON FUNCTION get_user_stats() IS 'Obtém estatísticas básicas de usuários (apenas para admins)';
COMMENT ON VIEW admin_users_view IS 'View para listar usuários (apenas para admins)';

-- 7. Verificar se tudo foi criado corretamente
DO $$
BEGIN
    RAISE NOTICE 'Configuração administrativa simples criada com sucesso!';
    RAISE NOTICE 'Usuários com role "admin" podem agora:';
    RAISE NOTICE '- Ver lista de usuários via admin_users_view';
    RAISE NOTICE '- Ver estatísticas via get_user_stats()';
    RAISE NOTICE 'Execute: SELECT * FROM admin_users_view; para testar';
END $$;
