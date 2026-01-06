-- =====================================================
-- SCRIPT DE CORREÇÃO DE AMBIGUIDADE (user_id) - VERSÃO 2 (FORCE DROP)
-- Autor: Antigravity
-- =====================================================

-- 0. Primeiro, remover a View que depende da função (para evitar erros de dependência)
DROP VIEW IF EXISTS admin_users_view;

-- 1. AGORA SIM, remover a função antiga problemática (necessário para mudar nome de parâmetro)
-- O CASCADE garante que se houver outras dependências, elas também serão tratadas/removidas
DROP FUNCTION IF EXISTS is_admin(UUID) CASCADE;

-- 2. Recriar is_admin com nome de parâmetro diferente (_user_id) para evitar ambiguidade
CREATE OR REPLACE FUNCTION is_admin(_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM user_profiles 
        WHERE user_profiles.user_id = _user_id 
        AND user_profiles.role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Sobrecarga sem argumentos (opcional, mantendo por conveniência)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN is_admin(auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Recriar a View usando a nova assinatura e referências explícitas
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
    p.rank,
    p.squadron
FROM auth.users u
LEFT JOIN user_profiles p ON u.id = p.user_id
WHERE is_admin(auth.uid());

-- Permissões
ALTER VIEW admin_users_view OWNER TO postgres;
GRANT SELECT ON admin_users_view TO authenticated;
GRANT SELECT ON admin_users_view TO service_role;

-- 5. Confirmação
DO $$
BEGIN
    RAISE NOTICE 'Correção de ambiguidade e function drop aplicados com sucesso.';
END $$;
