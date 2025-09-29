-- Tabela para notas pessoais
CREATE TABLE IF NOT EXISTS personal_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    military_id UUID NOT NULL REFERENCES military_personnel(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS para a tabela personal_notes
ALTER TABLE personal_notes ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para personal_notes
CREATE POLICY "personal_notes_read_own" ON personal_notes
FOR SELECT USING (auth.uid() = military_id);
CREATE POLICY "personal_notes_insert_own" ON personal_notes
FOR INSERT WITH CHECK (auth.uid() = military_id);
CREATE POLICY "personal_notes_update_own" ON personal_notes
FOR UPDATE USING (auth.uid() = military_id);
CREATE POLICY "personal_notes_delete_own" ON personal_notes
FOR DELETE USING (auth.uid() = military_id);

-- Create a trigger to update `updated_at` on each update
CREATE OR REPLACE TRIGGER update_personal_notes_updated_at
BEFORE UPDATE ON personal_notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
