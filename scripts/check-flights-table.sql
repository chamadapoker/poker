-- scripts/check-flights-table.sql
-- Verifica o status da tabela flights e suas políticas

-- 1. Verificar se a tabela existe
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_name = 'flights';

-- 2. Verificar a estrutura da tabela
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'flights'
ORDER BY ordinal_position;

-- 3. Verificar políticas RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'flights';

-- 4. Verificar se RLS está habilitado
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'flights';

-- 5. Verificar dados existentes
SELECT COUNT(*) as total_flights FROM flights;

-- 6. Verificar permissões do usuário atual
SELECT current_user, session_user;

-- 7. Testar uma consulta simples
SELECT 
    flight_number,
    origin,
    destination,
    status
FROM flights 
LIMIT 5;
