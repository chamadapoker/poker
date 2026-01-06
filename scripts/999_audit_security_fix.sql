-- =====================================================
-- SCRIPT MESTRE DE BLINDAGEM E SEGURANÇA (RLS) - VERSÃO FINAL
-- Sistema POKER 360
-- =====================================================
-- Este script garante que TODAS as tabelas do sistema tenham RLS ativo
-- e políticas de acesso adequadas.
--
-- BASEADO NA AUDITORIA VISUAL FINAL (IMAGENS DO BANCO)
--
-- REGRAS GERAIS:
-- 1. Ninguém acessa nada sem estar autenticado (anonimato bloqueado).
-- 2. Usuários autenticados têm permissão básica de leitura/escrita.

BEGIN;

-- =====================================================
-- 1. HABILITAR RLS EM TODAS AS TABELAS IDENTIFICADAS
-- =====================================================

-- Tabelas Core/Militares/Perfil
ALTER TABLE IF EXISTS military_personnel ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY; -- Variação encontrada

-- Tabelas de Presença (Ativas e Legado)
ALTER TABLE IF EXISTS military_attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS military_justifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS daily_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS justifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS absence_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS justifications_attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS daily_permanence_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS permanence_checklist ENABLE ROW LEVEL SECURITY;

-- Tabelas Operacionais e Eventos
ALTER TABLE IF EXISTS events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS military_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS military_flights ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS flight_schedules ENABLE ROW LEVEL SECURITY;
-- "display_schedule" não apareceu como tabela, assumindo ser flight_schedules ou view

-- Tabelas Claviculário
ALTER TABLE IF EXISTS claviculario_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS claviculario_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS claviculario_movements ENABLE ROW LEVEL SECURITY;

-- Tabelas TI
ALTER TABLE IF EXISTS ti_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ti_ticket_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ti_ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS ti_ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Tabelas Checklists e Categorias
ALTER TABLE IF EXISTS military_personal_checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS checklist_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS military_personal_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS checklist_items_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS checklist_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS checklist_items ENABLE ROW LEVEL SECURITY;

-- Tabelas Notas e Arquivos
ALTER TABLE IF EXISTS personal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS military_personal_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cancao_downloads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cancoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cleaning_records ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 2. FUNÇÃO UTILITÁRIA PARA RECRIAR POLÍTICAS
-- =====================================================
-- Remove políticas antigas e cria novas padrão "Authenticated Users Only"

DO $$
DECLARE
    t text;
    -- Lista Exaustiva baseada nas imagens do User
    tables text[] := ARRAY[
        'military_personnel', 'user_profiles', 'profiles',
        'military_attendance_records', 'military_justifications',
        'daily_attendance', 'justifications', 'absence_history', 'attendance_records', 'justifications_attendance_records',
        'daily_permanence_records', 'permanence_checklist',
        'events', 'military_events', 'flights', 'military_flights', 'flight_schedules',
        'claviculario_keys', 'claviculario_history', 'claviculario_movements',
        'ti_tickets', 'ti_ticket_history', 'ti_ticket_comments', 'ti_ticket_attachments',
        'military_personal_checklist_templates', 'checklist_template_items', 'military_personal_checklists', 'checklist_items_status',
        'checklist_categories', 'checklist_items',
        'personal_notes', 'military_personal_notes',
        'cancao_downloads', 'cancoes',
        'cleaning_records'
    ];
BEGIN
    FOREACH t IN ARRAY tables LOOP
        -- Verificar se tabela existe antes de tentar aplicar políticas
        -- Isso evita erro caso alguma tabela tenha sido renomeada ou deletada
        IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = t AND table_schema = 'public') THEN
            
            -- Remover políticas existentes (limpeza total)
            EXECUTE format('DROP POLICY IF EXISTS "Enable read access for all users" ON %I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON %I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Enable update for authenticated users only" ON %I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON %I', t);
            -- Remover variações comuns de nomes de policy
            EXECUTE format('DROP POLICY IF EXISTS "Allow public read access" ON %I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Allow public insert access" ON %I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Allow public update access" ON %I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Allow public delete access" ON %I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Public Select" ON %I', t);

            -- Limpar também as políticas que ESTE PRÓPRIO SCRIPT cria (para re-execução segura)
            EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can select" ON %I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can insert" ON %I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can update" ON %I', t);
            EXECUTE format('DROP POLICY IF EXISTS "Authenticated users can delete" ON %I', t);
            
            -- 1. SELECT (Leitura) - Autenticados apenas
            EXECUTE format('CREATE POLICY "Authenticated users can select" ON %I FOR SELECT USING (auth.role() = ''authenticated'')', t);
            
            -- 2. INSERT (Criação)
            EXECUTE format('CREATE POLICY "Authenticated users can insert" ON %I FOR INSERT WITH CHECK (auth.role() = ''authenticated'')', t);
            
            -- 3. UPDATE (Atualização)
            EXECUTE format('CREATE POLICY "Authenticated users can update" ON %I FOR UPDATE USING (auth.role() = ''authenticated'')', t);
            
            -- 4. DELETE (Exclusão)
            EXECUTE format('CREATE POLICY "Authenticated users can delete" ON %I FOR DELETE USING (auth.role() = ''authenticated'')', t);
            
            RAISE NOTICE 'RLS Blindado para tabela: %', t;
        END IF;
    END LOOP;
END $$;

COMMIT;

-- =====================================================
-- 3. TRATAMENTO DE VIEWS (Opcional)
-- =====================================================
-- Views não aceitam Policies da mesma forma.
-- Geralmente herdam permissão das tabelas base (se RLS habilitado nelas).
-- Se a view admin_users_view existir, garantimos que ela apenas repassa a segurança.

DO $$
BEGIN
    -- Tentar alterar a view para security_invoker (Postgres 15+)
    -- Isso faz com que a view respeite as permissões do usuário que a chama (RLS da tabela base)
    IF EXISTS (SELECT FROM information_schema.views WHERE table_name = 'admin_users_view' AND table_schema = 'public') THEN
        ALTER VIEW admin_users_view SET (security_invoker = true);
        RAISE NOTICE 'View admin_users_view alterada para security_invoker = true';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Não foi possível alterar admin_users_view para security_invoker. Verifique a versão do Postgres ou se é uma View materializada.';
END $$;

-- FIM DO SCRIPT
