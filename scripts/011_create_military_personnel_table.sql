CREATE TABLE IF NOT EXISTS military_personnel (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id TEXT UNIQUE, -- Clerk's user ID
    name TEXT NOT NULL,
    rank TEXT NOT NULL,
    squadron TEXT,
    role TEXT NOT NULL DEFAULT 'military', -- e.g., 'military', 'admin'
    email TEXT UNIQUE,
    phone_number TEXT,
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

CREATE TRIGGER update_military_personnel_updated_at
BEFORE UPDATE ON military_personnel
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- RLS Policy for military_personnel
ALTER TABLE military_personnel ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON military_personnel
FOR SELECT USING (TRUE);

CREATE POLICY "Enable insert for authenticated users only" ON military_personnel
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for authenticated users only" ON military_personnel
FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Enable delete for authenticated users only" ON military_personnel
FOR DELETE USING (auth.role() = 'authenticated');
