ALTER TABLE military_personal_checklist_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_template_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE military_personal_checklists ENABLE ROW LEVEL SECURITY;
ALTER TABLE checklist_items_status ENABLE ROW LEVEL SECURITY;

-- Policies for military_personal_checklist_templates
CREATE POLICY "Enable read access for all users" ON military_personal_checklist_templates
FOR SELECT USING (TRUE);
CREATE POLICY "Enable insert for authenticated users only" ON military_personal_checklist_templates
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON military_personal_checklist_templates
FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON military_personal_checklist_templates
FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for checklist_template_items
CREATE POLICY "Enable read access for all users" ON checklist_template_items
FOR SELECT USING (TRUE);
CREATE POLICY "Enable insert for authenticated users only" ON checklist_template_items
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON checklist_template_items
FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON checklist_template_items
FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for military_personal_checklists
CREATE POLICY "Enable read access for all users" ON military_personal_checklists
FOR SELECT USING (TRUE);
CREATE POLICY "Enable insert for authenticated users only" ON military_personal_checklists
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON military_personal_checklists
FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON military_personal_checklists
FOR DELETE USING (auth.role() = 'authenticated');

-- Policies for checklist_items_status
CREATE POLICY "Enable read access for all users" ON checklist_items_status
FOR SELECT USING (TRUE);
CREATE POLICY "Enable insert for authenticated users only" ON checklist_items_status
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON checklist_items_status
FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON checklist_items_status
FOR DELETE USING (auth.role() = 'authenticated');
