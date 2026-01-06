INSERT INTO claviculario_keys (key_name, location, status) VALUES
('Chave Sala de Comando', 'Sala de Comando', 'Disponível'),
('Chave Sala de Reuniões', 'Sala de Reuniões', 'Disponível'),
('Chave Almoxarifado', 'Almoxarifado', 'Disponível'),
('Chave Viatura 01', 'Garagem', 'Disponível'),
('Chave Viatura 02', 'Garagem', 'Disponível')
ON CONFLICT (key_name) DO NOTHING;
