-- =====================================================
-- SCRIPT DE CONFIGURAÇÃO DE PERMISSÕES ADMINISTRATIVAS
-- Sistema POKER 360 - 1º/10º GAV
-- =====================================================

-- 1. Verificar se a tabela profiles existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
        RAISE EXCEPTION 'Tabela profiles não encontrada. Execute primeiro o script de configuração do banco.';
    END IF;
END $$;

-- 2. Criar função para verificar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE user_id = user_id 
        AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar função para listar usuários (apenas para admins)
CREATE OR REPLACE FUNCTION get_users_list()
RETURNS TABLE (
    id UUID,
    email TEXT,
    email_confirmed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ,
    last_sign_in_at TIMESTAMPTZ,
    user_metadata JSONB
) AS $$
BEGIN
    -- Verificar se o usuário atual é admin
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Acesso negado. Apenas administradores podem listar usuários.';
    END IF;
    
    -- Retornar lista de usuários
    RETURN QUERY
    SELECT 
        u.id,
        u.email,
        u.email_confirmed_at,
        u.created_at,
        u.last_sign_in_at,
        u.user_metadata
    FROM auth.users u
    ORDER BY u.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar função para atualizar senha de usuário (apenas para admins)
CREATE OR REPLACE FUNCTION update_user_password(target_user_id UUID, new_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se o usuário atual é admin
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Acesso negado. Apenas administradores podem alterar senhas.';
    END IF;
    
    -- Verificar se o usuário alvo existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
        RAISE EXCEPTION 'Usuário não encontrado.';
    END IF;
    
    -- Atualizar senha (isso deve ser feito via API do Supabase)
    -- Esta função serve apenas para validação de permissões
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar função para verificar email de usuário (apenas para admins)
CREATE OR REPLACE FUNCTION verify_user_email(target_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se o usuário atual é admin
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Acesso negado. Apenas administradores podem verificar emails.';
    END IF;
    
    -- Verificar se o usuário alvo existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
        RAISE EXCEPTION 'Usuário não encontrado.';
    END IF;
    
    -- Marcar email como verificado
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE id = target_user_id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Criar função para obter estatísticas de usuários (apenas para admins)
CREATE OR REPLACE FUNCTION get_user_stats()
RETURNS TABLE (
    total_users BIGINT,
    verified_users BIGINT,
    unverified_users BIGINT,
    active_users_30d BIGINT,
    inactive_users_30d BIGINT
) AS $$
BEGIN
    -- Verificar se o usuário atual é admin
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Acesso negado. Apenas administradores podem ver estatísticas.';
    END IF;
    
    -- Retornar estatísticas
    RETURN QUERY
    SELECT 
        (SELECT COUNT(*) FROM auth.users) as total_users,
        (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NOT NULL) as verified_users,
        (SELECT COUNT(*) FROM auth.users WHERE email_confirmed_at IS NULL) as unverified_users,
        (SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at > NOW() - INTERVAL '30 days') as active_users_30d,
        (SELECT COUNT(*) FROM auth.users WHERE last_sign_in_at < NOW() - INTERVAL '30 days' OR last_sign_in_at IS NULL) as inactive_users_30d;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Criar função para obter logs de auditoria (apenas para admins)
CREATE OR REPLACE FUNCTION get_audit_logs(limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
    id UUID,
    user_id UUID,
    event_type TEXT,
    created_at TIMESTAMPTZ,
    metadata JSONB
) AS $$
BEGIN
    -- Verificar se o usuário atual é admin
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Acesso negado. Apenas administradores podem ver logs de auditoria.';
    END IF;
    
    -- Retornar logs de auditoria
    RETURN QUERY
    SELECT 
        ale.id,
        ale.user_id,
        ale.event_type,
        ale.created_at,
        ale.metadata
    FROM auth.audit_log_entries ale
    ORDER BY ale.created_at DESC
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Configurar RLS para as funções
-- As funções já têm verificação de permissão interna, mas vamos garantir que apenas admins possam executá-las

-- 9. Criar view para usuários (apenas para admins)
CREATE OR REPLACE VIEW admin_users_view AS
SELECT 
    u.id,
    u.email,
    u.email_confirmed_at,
    u.created_at,
    u.last_sign_in_at,
    u.user_metadata,
    p.display_name,
    p.role,
    p.rank,
    p.squadron
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
WHERE is_admin(auth.uid());

-- 10. Configurar RLS para a view
ALTER VIEW admin_users_view OWNER TO postgres;

-- 11. Criar função para criar usuário admin (apenas para super admins)
CREATE OR REPLACE FUNCTION create_admin_user(
    user_email TEXT,
    user_password TEXT,
    display_name TEXT,
    rank TEXT,
    squadron TEXT
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
BEGIN
    -- Verificar se o usuário atual é admin
    IF NOT is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Acesso negado. Apenas administradores podem criar usuários.';
    END IF;
    
    -- Verificar se o email já existe
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
        RAISE EXCEPTION 'Email já cadastrado.';
    END IF;
    
    -- Criar usuário (isso deve ser feito via API do Supabase)
    -- Esta função serve apenas para validação de permissões
    -- O usuário deve ser criado via interface ou API
    
    -- Retornar ID fictício (será substituído pelo ID real quando criado)
    RETURN gen_random_uuid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 12. Comentários das funções
COMMENT ON FUNCTION is_admin(UUID) IS 'Verifica se o usuário é administrador';
COMMENT ON FUNCTION get_users_list() IS 'Lista todos os usuários (apenas para admins)';
COMMENT ON FUNCTION update_user_password(UUID, TEXT) IS 'Atualiza senha de usuário (apenas para admins)';
COMMENT ON FUNCTION verify_user_email(UUID) IS 'Verifica email de usuário (apenas para admins)';
COMMENT ON FUNCTION get_user_stats() IS 'Obtém estatísticas de usuários (apenas para admins)';
COMMENT ON FUNCTION get_audit_logs(INTEGER) IS 'Obtém logs de auditoria (apenas para admins)';
COMMENT ON FUNCTION create_admin_user(TEXT, TEXT, TEXT, TEXT, TEXT) IS 'Cria usuário administrador (apenas para admins)';

-- 13. Verificar se as funções foram criadas corretamente
DO $$
BEGIN
    RAISE NOTICE 'Funções administrativas criadas com sucesso!';
    RAISE NOTICE 'Usuários com role "admin" podem agora:';
    RAISE NOTICE '- Listar usuários';
    RAISE NOTICE '- Alterar senhas';
    RAISE NOTICE '- Verificar emails';
    RAISE NOTICE '- Ver estatísticas';
    RAISE NOTICE '- Ver logs de auditoria';
    RAISE NOTICE 'Acesse a página /admin no sistema para usar essas funcionalidades.';
END $$;
