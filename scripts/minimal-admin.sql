-- =====================================================
-- SCRIPT MÍNIMO DE ADMINISTRAÇÃO (SEM DEPENDÊNCIAS DE PROFILES)
-- Sistema POKER 360 - 1º/10º GAV
-- =====================================================

-- 1. Criar função simples para verificar se o usuário é admin
-- (Assumindo que a tabela profiles tem uma coluna 'role')
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se a tabela profiles existe e tem a coluna role
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'role'
    ) THEN
        RETURN EXISTS (
            SELECT 1 FROM profiles 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        );
    ELSE
        -- Se não existir a tabela profiles ou coluna role, assumir que todos são admin
        -- (apenas para desenvolvimento - REMOVER EM PRODUÇÃO)
        RETURN TRUE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar view mínima para listar usuários (apenas dados básicos)
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
FROM auth.users u
WHERE is_admin();

-- 3. Criar função para obter estatísticas básicas
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
        (SELECT COUNT(*) FROM auth.users) as admin_users; -- Assumindo todos são admin por enquanto
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Configurar permissões
GRANT SELECT ON admin_users_view TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_stats() TO authenticated;

-- 5. Comentários
COMMENT ON FUNCTION is_admin() IS 'Verifica se o usuário atual é administrador';
COMMENT ON FUNCTION get_user_stats() IS 'Obtém estatísticas básicas de usuários (apenas para admins)';
COMMENT ON VIEW admin_users_view IS 'View mínima para listar usuários (apenas para admins)';

-- 6. Teste básico
DO $$
BEGIN
    RAISE NOTICE 'Configuração mínima criada com sucesso!';
    RAISE NOTICE 'Execute: SELECT * FROM admin_users_view; para testar';
    RAISE NOTICE 'Execute: SELECT * FROM get_user_stats(); para ver estatísticas';
    RAISE NOTICE 'NOTA: Este script funciona independente da estrutura da tabela profiles';
END $$;
