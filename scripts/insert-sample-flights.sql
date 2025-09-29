-- scripts/insert-sample-flights.sql
-- Insere dados de exemplo na tabela flights para testes

-- Primeiro, vamos desabilitar RLS temporariamente para inserir dados
ALTER TABLE flights DISABLE ROW LEVEL SECURITY;

-- Inserir voos de exemplo
INSERT INTO flights (
    flight_number,
    aircraft_type,
    departure_time,
    arrival_time,
    origin,
    destination,
    pilot_id,
    copilot_id,
    status,
    notes
) VALUES 
    (
        'FAB-001',
        'EMB-314 Super Tucano',
        '2025-09-01 08:00:00+00',
        '2025-09-01 10:30:00+00',
        'Base Aérea de Brasília',
        'Campo de Provas Brigadeiro Velloso',
        NULL,
        NULL,
        'Scheduled',
        'Voo de treinamento - Tiro aéreo'
    ),
    (
        'FAB-002',
        'EMB-314 Super Tucano',
        '2025-09-02 14:00:00+00',
        '2025-09-02 16:00:00+00',
        'Base Aérea de Anápolis',
        'Base Aérea de Brasília',
        NULL,
        NULL,
        'Scheduled',
        'Transferência de aeronave'
    ),
    (
        'FAB-003',
        'EMB-314 Super Tucano',
        '2025-09-03 09:00:00+00',
        '2025-09-03 11:30:00+00',
        'Base Aérea de Brasília',
        'Base Aérea de Santa Cruz',
        NULL,
        NULL,
        'Scheduled',
        'Missão de reconhecimento'
    ),
    (
        'FAB-004',
        'EMB-314 Super Tucano',
        '2025-09-01 13:00:00+00',
        '2025-09-01 15:00:00+00',
        'Base Aérea de Brasília',
        'Base Aérea de Anápolis',
        NULL,
        NULL,
        'Departed',
        'Voo de navegação - concluído'
    ),
    (
        'FAB-005',
        'EMB-314 Super Tucano',
        '2025-09-02 07:00:00+00',
        '2025-09-02 09:00:00+00',
        'Base Aérea de Anápolis',
        'Base Aérea de Brasília',
        NULL,
        NULL,
        'Arrived',
        'Voo de retorno - pouso realizado'
    );

-- Reabilitar RLS
ALTER TABLE flights ENABLE ROW LEVEL SECURITY;

-- Verificar os dados inseridos
SELECT 
    flight_number,
    aircraft_type,
    departure_time,
    arrival_time,
    origin,
    destination,
    status,
    notes
FROM flights 
ORDER BY departure_time;
