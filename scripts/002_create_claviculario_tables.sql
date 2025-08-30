CREATE TABLE IF NOT EXISTS claviculario_keys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_name TEXT NOT NULL UNIQUE,
    location TEXT,
    status TEXT NOT NULL DEFAULT 'Disponível', -- e.g., 'Disponível', 'Em Uso', 'Manutenção', 'Perdida'
    last_checked_out_by UUID REFERENCES military_personnel(id),
    last_checked_out_at TIMESTAMP WITH TIME ZONE,
    last_checked_in_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS claviculario_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key_id UUID NOT NULL REFERENCES claviculario_keys(id) ON DELETE CASCADE,
    military_id UUID NOT NULL REFERENCES military_personnel(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'Retirada' or 'Devolvida'
    action_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Triggers for updated_at
CREATE TRIGGER update_claviculario_keys_updated_at
BEFORE UPDATE ON claviculario_keys
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_claviculario_history_updated_at
BEFORE UPDATE ON claviculario_history
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies for claviculario_keys
ALTER TABLE claviculario_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON claviculario_keys
FOR SELECT USING (TRUE);

CREATE POLICY "Enable insert for authenticated users only" ON claviculario_keys
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON claviculario_keys
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON claviculario_keys
FOR DELETE USING (auth.role() = 'authenticated');

-- RLS Policies for claviculario_history
ALTER TABLE claviculario_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON claviculario_history
FOR SELECT USING (TRUE);

CREATE POLICY "Enable insert for authenticated users only" ON claviculario_history
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON claviculario_history
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON claviculario_history
FOR DELETE USING (auth.role() = 'authenticated');
