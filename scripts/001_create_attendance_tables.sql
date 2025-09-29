-- Tabela para registrar a presença diária
CREATE TABLE IF NOT EXISTS daily_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    military_id UUID REFERENCES military_personnel(id),
    date DATE NOT NULL,
    status TEXT NOT NULL, -- 'presente', 'ausente', 'dispensado', 'servico'
    justification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para gerenciar justificativas de ausência
CREATE TABLE IF NOT EXISTS justifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    military_id UUID REFERENCES military_personnel(id),
    attendance_id UUID REFERENCES daily_attendance(id),
    type TEXT NOT NULL, -- 'medico', 'particular', 'servico', etc.
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    approved_by UUID REFERENCES military_personnel(id), -- Quem aprovou
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para registrar o histórico de faltas
CREATE TABLE IF NOT EXISTS absence_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    military_id UUID REFERENCES military_personnel(id),
    date DATE NOT NULL,
    type TEXT NOT NULL, -- 'falta', 'atraso', 'dispensa'
    justified BOOLEAN DEFAULT FALSE,
    justification_id UUID REFERENCES justifications(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela para registrar o histórico de presença militar
CREATE TABLE IF NOT EXISTS military_attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    military_id UUID NOT NULL REFERENCES military_personnel(id) ON DELETE CASCADE,
    military_name TEXT NOT NULL,
    rank TEXT NOT NULL,
    call_type TEXT NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL,
    justification_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a trigger to update the `updated_at` column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_military_attendance_records_updated_at
BEFORE UPDATE ON military_attendance_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Tabela para gerenciar justificativas de presença militar
CREATE TABLE IF NOT EXISTS military_justifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    military_id UUID NOT NULL REFERENCES military_personnel(id) ON DELETE CASCADE,
    military_name TEXT NOT NULL,
    type TEXT NOT NULL, -- e.g., "Férias", "Missão", "Dispensa Médica", "Curso"
    reason TEXT NOT NULL, -- Detailed reason
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    approved BOOLEAN DEFAULT FALSE,
    approved_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create a trigger to update `updated_at` on each update
CREATE OR REPLACE TRIGGER update_military_justifications_updated_at
BEFORE UPDATE ON military_justifications
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Tabela para registrar o histórico de presença
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    military_id UUID NOT NULL,
    date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'presente', 'ausente', 'dispensado'
    justification TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela para gerenciar justificativas de presença
CREATE TABLE IF NOT EXISTS justifications_attendance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    military_id UUID NOT NULL,
    attendance_record_id UUID REFERENCES attendance_records(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- e.g., 'medica', 'servico', 'particular'
    description TEXT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(50) NOT NULL, -- e.g., 'pendente', 'aprovada', 'rejeitada'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Habilitar RLS para as novas tabelas
ALTER TABLE daily_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE justifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE absence_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE military_attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE military_justifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE justifications_attendance_records ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para daily_attendance
CREATE POLICY "daily_attendance_read_all" ON daily_attendance
FOR SELECT USING (TRUE);
CREATE POLICY "daily_attendance_insert_auth" ON daily_attendance
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "daily_attendance_update_own" ON daily_attendance
FOR UPDATE USING (auth.uid() = military_id);
CREATE POLICY "daily_attendance_delete_own" ON daily_attendance
FOR DELETE USING (auth.uid() = military_id);

-- Políticas de RLS para justifications
CREATE POLICY "justifications_read_all" ON justifications
FOR SELECT USING (TRUE);
CREATE POLICY "justifications_insert_auth" ON justifications
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "justifications_update_own" ON justifications
FOR UPDATE USING (auth.uid() = military_id);
CREATE POLICY "justifications_delete_own" ON justifications
FOR DELETE USING (auth.uid() = military_id);

-- Políticas de RLS para absence_history
CREATE POLICY "absence_history_read_all" ON absence_history
FOR SELECT USING (TRUE);
CREATE POLICY "absence_history_insert_auth" ON absence_history
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "absence_history_update_own" ON absence_history
FOR UPDATE USING (auth.uid() = military_id);
CREATE POLICY "absence_history_delete_own" ON absence_history
FOR DELETE USING (auth.uid() = military_id);

-- Políticas de RLS para military_attendance_records
CREATE POLICY "Enable read access for all users" ON military_attendance_records
FOR SELECT USING (TRUE);

CREATE POLICY "Enable insert for authenticated users only" ON military_attendance_records
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON military_attendance_records
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON military_attendance_records
FOR DELETE USING (auth.role() = 'authenticated');

-- Políticas de RLS para military_justifications
CREATE POLICY "military_justifications_read_all" ON military_justifications
FOR SELECT USING (TRUE);
CREATE POLICY "military_justifications_insert_auth" ON military_justifications
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "military_justifications_update_own" ON military_justifications
FOR UPDATE USING (auth.uid() = military_id);
CREATE POLICY "military_justifications_delete_own" ON military_justifications
FOR DELETE USING (auth.uid() = military_id);

-- Políticas de RLS para attendance_records
CREATE POLICY "attendance_records_read_all" ON attendance_records
FOR SELECT USING (TRUE);
CREATE POLICY "attendance_records_insert_auth" ON attendance_records
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "attendance_records_update_own" ON attendance_records
FOR UPDATE USING (auth.uid() = military_id);
CREATE POLICY "attendance_records_delete_own" ON attendance_records
FOR DELETE USING (auth.uid() = military_id);

-- Políticas de RLS para justifications (attendance_records)
CREATE POLICY "justifications_read_all_attendance_records" ON justifications_attendance_records
FOR SELECT USING (TRUE);
CREATE POLICY "justifications_insert_auth_attendance_records" ON justifications_attendance_records
FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "justifications_update_own_attendance_records" ON justifications_attendance_records
FOR UPDATE USING (auth.uid() = military_id);
CREATE POLICY "justifications_delete_own_attendance_records" ON justifications_attendance_records
FOR DELETE USING (auth.uid() = military_id);
