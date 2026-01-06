-- SCRIPT DE MIGRAÇÃO: POPULAR MILITARY_PERSONNEL
-- Baseado no arquivo lib/static-data.ts
-- Autor: Antigravity
-- Data: 2026-01-06

-- 1. Limpar dados existentes (opcional, para garantir idêntico ao estático durante a migração)
-- DELETE FROM military_personnel; -- Comentado por segurança

-- 2. Inserir dados estáticos (Removido 'role' pois a tabela atual não possui)
INSERT INTO military_personnel (name, rank) VALUES
('CARNEIRO', 'TC'),
('MAIA', 'MJ'),
('MIRANDA', 'CP'),
('CAMILA CALDAS', 'CP'),
('FARIAS', 'CP'),
('SPINELLI', 'CP'),
('ALMEIDA', 'CP'),
('JÚNIOR', 'CP'),
('FELIPPE MIRANDA', 'CP'),
('EDUARDO', 'CP'),
('MAIRINK', 'CP'),
('ISMAEL', '1T'),
('OBREGON', '2T'),
('ELIASAFE', 'SO'),
('MENEZES', '1S'),
('JACOBS', '1S'),
('RIBAS', '2S'),
('EDGAR', '2S'),
('MADUREIRO', '2S'),
('ORIEL', '2S'),
('FRANK', '2S'),
('BRAZ', '2S'),
('PITTIGLIANI', '3S'),
('L. TEIXEIRA', '3S'),
('MAIA', '3S'),
('ANNE', '3S'),
('JAQUES', '3S'),
('HOEHR', '3S'),
('VILELA', '3S'),
('HENRIQUE', '3S'),
('NYCOLAS', 'S1'),
('GABRIEL REIS', 'S1'),
('DOUGLAS SILVA', 'S2'),
('DA ROSA', 'S2'),
('DENARDIN', 'S2'),
('JOÃO GABRIEL', 'S2'),
('VIEIRA', 'S2')
ON CONFLICT DO NOTHING;

-- 3. Verificação
SELECT count(*) as total_migrated FROM military_personnel;
