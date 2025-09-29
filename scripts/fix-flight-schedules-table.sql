-- Script para corrigir a estrutura da tabela flight_schedules
-- Verifica se a tabela existe e adiciona a coluna flight_time se necessário

-- 1. Verificar se a tabela existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'flight_schedules') THEN
        -- Criar a tabela se não existir
        CREATE TABLE flight_schedules (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            flight_date DATE NOT NULL,
            flight_time TIME NOT NULL,
            military_ids TEXT NOT NULL, -- JSON array como string
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        RAISE NOTICE 'Tabela flight_schedules criada com sucesso';
    ELSE
        RAISE NOTICE 'Tabela flight_schedules já existe';
    END IF;
END $$;

-- 2. Verificar se a coluna flight_time existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'flight_schedules' 
        AND column_name = 'flight_time'
    ) THEN
        -- Adicionar a coluna flight_time se não existir
        ALTER TABLE flight_schedules ADD COLUMN flight_time TIME;
        RAISE NOTICE 'Coluna flight_time adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna flight_time já existe';
    END IF;
END $$;

-- 3. Verificar se a coluna military_ids existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'flight_schedules' 
        AND column_name = 'military_ids'
    ) THEN
        -- Adicionar a coluna military_ids se não existir
        ALTER TABLE flight_schedules ADD COLUMN military_ids TEXT;
        RAISE NOTICE 'Coluna military_ids adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna military_ids já existe';
    END IF;
END $$;

-- 4. Criar trigger para updated_at se não existir
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 5. Criar trigger se não existir
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM pg_trigger 
        WHERE tgname = 'update_flight_schedules_updated_at'
    ) THEN
        CREATE TRIGGER update_flight_schedules_updated_at 
            BEFORE UPDATE ON flight_schedules 
            FOR EACH ROW 
            EXECUTE FUNCTION update_updated_at_column();
        RAISE NOTICE 'Trigger update_flight_schedules_updated_at criado com sucesso';
    ELSE
        RAISE NOTICE 'Trigger update_flight_schedules_updated_at já existe';
    END IF;
END $$;

-- 6. Desabilitar RLS para permitir acesso
ALTER TABLE flight_schedules DISABLE ROW LEVEL SECURITY;

-- 7. Garantir permissões
GRANT ALL ON flight_schedules TO anon;
GRANT ALL ON flight_schedules TO authenticated;
GRANT ALL ON flight_schedules TO service_role;

-- 8. Mostrar estrutura final da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'flight_schedules'
ORDER BY ordinal_position;

-- 9. Verificar se há dados na tabela
SELECT COUNT(*) as total_registros FROM flight_schedules;
