-- Script para corrigir a tabela daily_permanence_records
-- Este script verifica se a tabela existe e a recria se necessário

-- Primeiro, vamos dropar a tabela se ela existir (para recriar)
DROP TABLE IF EXISTS daily_permanence_records CASCADE;

-- Recriar a tabela com a estrutura correta
CREATE TABLE daily_permanence_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    military_id TEXT NOT NULL, -- Mudando para TEXT para compatibilidade
    military_name TEXT NOT NULL,
    rank TEXT NOT NULL,
    date DATE NOT NULL,
    status TEXT NOT NULL DEFAULT 'presente',
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (military_id, date)
);

-- Desabilitar RLS temporariamente para facilitar os testes
ALTER TABLE daily_permanence_records DISABLE ROW LEVEL SECURITY;

-- Inserir alguns dados de teste para verificar se está funcionando
INSERT INTO daily_permanence_records (military_id, military_name, rank, date, status, details) VALUES
('1', 'NYCOLAS', 'S1', CURRENT_DATE, 'presente', '{"checklist": [], "notes": "Teste"}'),
('2', 'GABRIEL REIS', 'S1', CURRENT_DATE, 'presente', '{"checklist": [], "notes": "Teste"}');

-- Verificar se a tabela foi criada corretamente
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'daily_permanence_records'
ORDER BY ordinal_position;

-- Mostrar os dados inseridos
SELECT * FROM daily_permanence_records;
