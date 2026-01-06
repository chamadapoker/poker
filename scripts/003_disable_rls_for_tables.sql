-- Disable RLS for tables that might not have it enabled yet, or for specific operations if needed.
-- This script is generally for development/debugging or specific migration steps.
-- In production, RLS should be carefully managed.

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

-- Re-enable RLS with default policies (or specific ones if defined elsewhere)
-- For military_attendance_records
ALTER TABLE military_attendance_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON military_attendance_records;
CREATE POLICY "Enable read access for all users" ON military_attendance_records FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON military_attendance_records;
CREATE POLICY "Enable insert for authenticated users only" ON military_attendance_records FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON military_attendance_records;
CREATE POLICY "Enable update for authenticated users only" ON military_attendance_records FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON military_attendance_records;
CREATE POLICY "Enable delete for authenticated users only" ON military_attendance_records FOR DELETE USING (auth.role() = 'authenticated');

-- For military_justifications
ALTER TABLE military_justifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON military_justifications;
CREATE POLICY "Enable read access for all users" ON military_justifications FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON military_justifications;
CREATE POLICY "Enable insert for authenticated users only" ON military_justifications FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON military_justifications;
CREATE POLICY "Enable update for authenticated users only" ON military_justifications FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON military_justifications;
CREATE POLICY "Enable delete for authenticated users only" ON military_justifications FOR DELETE USING (auth.role() = 'authenticated');

-- For daily_permanence_records
ALTER TABLE daily_permanence_records ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON daily_permanence_records;
CREATE POLICY "Enable read access for all users" ON daily_permanence_records FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON daily_permanence_records;
CREATE POLICY "Enable insert for authenticated users only" ON daily_permanence_records FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON daily_permanence_records;
CREATE POLICY "Enable update for authenticated users only" ON daily_permanence_records FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON daily_permanence_records;
CREATE POLICY "Enable delete for authenticated users only" ON daily_permanence_records FOR DELETE USING (auth.role() = 'authenticated');

-- For claviculario_keys
ALTER TABLE claviculario_keys ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON claviculario_keys;
CREATE POLICY "Enable read access for all users" ON claviculario_keys FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON claviculario_keys;
CREATE POLICY "Enable insert for authenticated users only" ON claviculario_keys FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON claviculario_keys;
CREATE POLICY "Enable update for authenticated users only" ON claviculario_keys FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON claviculario_keys;
CREATE POLICY "Enable delete for authenticated users only" ON claviculario_keys FOR DELETE USING (auth.role() = 'authenticated');

-- For claviculario_history
ALTER TABLE claviculario_history ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON claviculario_history;
CREATE POLICY "Enable read access for all users" ON claviculario_history FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON claviculario_history;
CREATE POLICY "Enable insert for authenticated users only" ON claviculario_history FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON claviculario_history;
CREATE POLICY "Enable update for authenticated users only" ON claviculario_history FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON claviculario_history;
CREATE POLICY "Enable delete for authenticated users only" ON claviculario_history FOR DELETE USING (auth.role() = 'authenticated');

-- For events
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON events;
CREATE POLICY "Enable read access for all users" ON events FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON events;
CREATE POLICY "Enable insert for authenticated users only" ON events FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON events;
CREATE POLICY "Enable update for authenticated users only" ON events FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON events;
CREATE POLICY "Enable delete for authenticated users only" ON events FOR DELETE USING (auth.role() = 'authenticated');

-- For flights
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON flights;
CREATE POLICY "Enable read access for all users" ON flights FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON flights;
CREATE POLICY "Enable insert for authenticated users only" ON flights FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON flights;
CREATE POLICY "Enable update for authenticated users only" ON flights FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON flights;
CREATE POLICY "Enable delete for authenticated users only" ON flights FOR DELETE USING (auth.role() = 'authenticated');

-- For personal_notes
ALTER TABLE personal_notes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON personal_notes;
CREATE POLICY "Enable read access for all users" ON personal_notes FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON personal_notes;
CREATE POLICY "Enable insert for authenticated users only" ON personal_notes FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON personal_notes;
CREATE POLICY "Enable update for authenticated users only" ON personal_notes FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON personal_notes;
CREATE POLICY "Enable delete for authenticated users only" ON personal_notes FOR DELETE USING (auth.role() = 'authenticated');

-- For military_personal_checklist_templates
ALTER TABLE military_personal_checklist_templates ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON military_personal_checklist_templates;
CREATE POLICY "Enable read access for all users" ON military_personal_checklist_templates FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON military_personal_checklist_templates;
CREATE POLICY "Enable insert for authenticated users only" ON military_personal_checklist_templates FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON military_personal_checklist_templates;
CREATE POLICY "Enable update for authenticated users only" ON military_personal_checklist_templates FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON military_personal_checklist_templates;
CREATE POLICY "Enable delete for authenticated users only" ON military_personal_checklist_templates FOR DELETE USING (auth.role() = 'authenticated');

-- For checklist_template_items
ALTER TABLE checklist_template_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON checklist_template_items;
CREATE POLICY "Enable read access for all users" ON checklist_template_items FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON checklist_template_items;
CREATE POLICY "Enable insert for authenticated users only" ON checklist_template_items FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON checklist_template_items;
CREATE POLICY "Enable update for authenticated users only" ON checklist_template_items FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON checklist_template_items;
CREATE POLICY "Enable delete for authenticated users only" ON checklist_template_items FOR DELETE USING (auth.role() = 'authenticated');

-- For military_personal_checklists
ALTER TABLE military_personal_checklists ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON military_personal_checklists;
CREATE POLICY "Enable read access for all users" ON military_personal_checklists FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON military_personal_checklists;
CREATE POLICY "Enable insert for authenticated users only" ON military_personal_checklists FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON military_personal_checklists;
CREATE POLICY "Enable update for authenticated users only" ON military_personal_checklists FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON military_personal_checklists;
CREATE POLICY "Enable delete for authenticated users only" ON military_personal_checklists FOR DELETE USING (auth.role() = 'authenticated');

-- For checklist_items_status
ALTER TABLE checklist_items_status ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON checklist_items_status;
CREATE POLICY "Enable read access for all users" ON checklist_items_status FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON checklist_items_status;
CREATE POLICY "Enable insert for authenticated users only" ON checklist_items_status FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON checklist_items_status;
CREATE POLICY "Enable update for authenticated users only" ON checklist_items_status FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON checklist_items_status;
CREATE POLICY "Enable delete for authenticated users only" ON checklist_items_status FOR DELETE USING (auth.role() = 'authenticated');

-- For military_personnel
ALTER TABLE military_personnel ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable read access for all users" ON military_personnel;
CREATE POLICY "Enable read access for all users" ON military_personnel FOR SELECT USING (TRUE);
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON military_personnel;
CREATE POLICY "Enable insert for authenticated users only" ON military_personnel FOR INSERT WITH CHECK (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON military_personnel;
CREATE POLICY "Enable update for authenticated users only" ON military_personnel FOR UPDATE USING (auth.role() = 'authenticated');
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON military_personnel;
CREATE POLICY "Enable delete for authenticated users only" ON military_personnel FOR DELETE USING (auth.role() = 'authenticated');
