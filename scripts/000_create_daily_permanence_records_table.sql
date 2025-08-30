CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS daily_permanence_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    military_id UUID NOT NULL REFERENCES military_personnel(id) ON DELETE CASCADE,
    military_name TEXT NOT NULL,
    rank TEXT NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'presente', -- 'presente', 'ausente', 'dispensado', 'servico'
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (military_id, date)
);

-- Enable Row Level Security (RLS)
ALTER TABLE daily_permanence_records ENABLE ROW LEVEL SECURITY;

-- Create policies for RLS
CREATE POLICY "Enable read access for all users" ON daily_permanence_records
FOR SELECT USING (TRUE);

CREATE POLICY "Enable insert for authenticated users" ON daily_permanence_records
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users on their own records" ON daily_permanence_records
FOR UPDATE USING (auth.uid() = military_id);

CREATE POLICY "Enable delete for authenticated users on their own records" ON daily_permanence_records
FOR DELETE USING (auth.uid() = military_id);

-- Function to update `updated_at` column automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to update `updated_at` on each update
CREATE OR REPLACE TRIGGER update_daily_permanence_records_updated_at
BEFORE UPDATE ON daily_permanence_records
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
