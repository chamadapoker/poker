-- Adicionar constraint UNIQUE para permitir UPSERT seguro
-- Isso garante que não haverá duplicidade de registros para o mesmo militar no mesmo dia
-- E permite que atualizemos o status individualmente sem apagar os outros registros

DO $$
BEGIN
    -- Verifica se a constraint já existe para evitar erro
    IF NOT EXISTS (
        SELECT 1 
        FROM pg_constraint 
        WHERE conname = 'unique_attendance_per_day'
    ) THEN
        -- Tenta adicionar a constraint
        -- Nota: Isso pode falhar se JÁ houver duplicatas no banco.
        -- Se falhar, o usuário precisará limpar os registros duplicados de hoje primeiro.
        ALTER TABLE military_attendance_records 
        ADD CONSTRAINT unique_attendance_per_day UNIQUE (military_id, date);
        
        RAISE NOTICE 'Constraint unique_attendance_per_day adicionada com sucesso.';
    ELSE
        RAISE NOTICE 'Constraint unique_attendance_per_day já existe.';
    END IF;
END $$;
