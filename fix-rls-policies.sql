-- Script para corrigir políticas RLS e permitir acesso público às tabelas
-- Execute este script no SQL Editor do Supabase

-- 1. Desabilitar RLS temporariamente para todas as tabelas
ALTER TABLE military_attendance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE military_justifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE daily_permanence_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE claviculario_keys DISABLE ROW LEVEL SECURITY;
ALTER TABLE claviculario_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE flights DISABLE ROW LEVEL SECURITY;
ALTER TABLE personal_notes DISABLE ROW LEVEL SECURITY;
ALTER TABLE military_personal_checklist_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_template_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE military_personal_checklists DISABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items_status DISABLE ROW LEVEL SECURITY;
ALTER TABLE military_personnel DISABLE ROW LEVEL SECURITY;

-- 2. Reabilitar RLS com políticas que permitem leitura pública
-- military_attendance_records
ALTER TABLE military_attendance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON military_attendance_records;
CREATE POLICY "Enable read access for all users" ON military_attendance_records FOR SELECT USING (TRUE);

-- military_justifications
ALTER TABLE military_justifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON military_justifications;
CREATE POLICY "Enable read access for all users" ON military_justifications FOR SELECT USING (TRUE);

-- daily_permanence_records
ALTER TABLE daily_permanence_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON daily_permanence_records;
CREATE POLICY "Enable read access for all users" ON daily_permanence_records FOR SELECT USING (TRUE);

-- claviculario_keys
ALTER TABLE claviculario_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON claviculario_keys;
CREATE POLICY "Enable read access for all users" ON claviculario_keys FOR SELECT USING (TRUE);

-- claviculario_history
ALTER TABLE claviculario_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON claviculario_history;
CREATE POLICY "Enable read access for all users" ON claviculario_history FOR SELECT USING (TRUE);

-- events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON events;
CREATE POLICY "Enable read access for all users" ON events FOR SELECT USING (TRUE);

-- flights
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON flights;
CREATE POLICY "Enable read access for all users" ON flights FOR SELECT USING (TRUE);

-- personal_notes
ALTER TABLE personal_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON personal_notes;
CREATE POLICY "Enable read access for all users" ON personal_notes FOR SELECT USING (TRUE);

-- military_personal_checklist_templates
ALTER TABLE military_personal_checklist_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON military_personal_checklist_templates;
CREATE POLICY "Enable read access for all users" ON military_personal_checklist_templates FOR SELECT USING (TRUE);

-- checklist_template_items
ALTER TABLE checklist_template_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON checklist_template_items;
CREATE POLICY "Enable read access for all users" ON checklist_template_items FOR SELECT USING (TRUE);

-- military_personal_checklists
ALTER TABLE military_personal_checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON military_personal_checklists;
CREATE POLICY "Enable read access for all users" ON military_personal_checklists FOR SELECT USING (TRUE);

-- checklist_items_status
ALTER TABLE checklist_items_status ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON checklist_items_status;
CREATE POLICY "Enable read access for all users" ON checklist_items_status FOR SELECT USING (TRUE);

-- military_personnel
ALTER TABLE military_personnel ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON military_personnel;
CREATE POLICY "Enable read access for all users" ON military_personnel FOR SELECT USING (TRUE);

-- 3. Verificar se as políticas foram criadas
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
