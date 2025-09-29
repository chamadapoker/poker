-- Desabilitar RLS para as novas tabelas (se necessário, para migração ou testes)
-- CUIDADO: Isso remove todas as políticas de RLS existentes para a tabela.
-- Use com cautela e reabilite as políticas após a operação.

ALTER TABLE events DISABLE ROW LEVEL SECURITY;
ALTER TABLE flights DISABLE ROW LEVEL SECURITY;
ALTER TABLE personal_notes DISABLE ROW LEVEL SECURITY;

ALTER TABLE military_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE military_flights DISABLE ROW LEVEL SECURITY;
ALTER TABLE military_personal_notes DISABLE ROW LEVEL SECURITY;
