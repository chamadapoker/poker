CREATE TABLE IF NOT EXISTS military_personal_checklist_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS checklist_template_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID NOT NULL REFERENCES military_personal_checklist_templates(id) ON DELETE CASCADE,
    item_description TEXT NOT NULL,
    item_order INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (template_id, item_order)
);

CREATE TABLE IF NOT EXISTS military_personal_checklists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    military_id UUID NOT NULL REFERENCES military_personnel(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES military_personal_checklist_templates(id) ON DELETE CASCADE,
    checklist_date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending', -- e.g., 'Pending', 'Completed', 'In Progress'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (military_id, template_id, checklist_date)
);

CREATE TABLE IF NOT EXISTS checklist_items_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    checklist_id UUID NOT NULL REFERENCES military_personal_checklists(id) ON DELETE CASCADE,
    template_item_id UUID NOT NULL REFERENCES checklist_template_items(id) ON DELETE CASCADE,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (checklist_id, template_item_id)
);

-- Triggers for updated_at
CREATE TRIGGER update_military_personal_checklist_templates_updated_at
BEFORE UPDATE ON military_personal_checklist_templates
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_template_items_updated_at
BEFORE UPDATE ON checklist_template_items
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_military_personal_checklists_updated_at
BEFORE UPDATE ON military_personal_checklists
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checklist_items_status_updated_at
BEFORE UPDATE ON checklist_items_status
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
