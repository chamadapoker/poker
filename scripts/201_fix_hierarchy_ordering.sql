-- =====================================================
-- SCRIPT DE CORREÇÃO DE HIERARQUIA (ANTIGUIDADE)
-- ADICIONA COLUNA 'SENIORITY' E RESTAURA ORDEM ORIGINAL
-- =====================================================

-- 1. Adicionar coluna de antiguidade (se não existir)
ALTER TABLE military_personnel ADD COLUMN IF NOT EXISTS seniority INTEGER DEFAULT 999;

-- 2. Atualizar antiguidade baseada na lista original (static-data.ts)
-- Formato: UPDATE ... SET seniority = N WHERE name = 'X' AND rank = 'Y';

-- TC
UPDATE military_personnel SET seniority = 1 WHERE name = 'CARNEIRO' AND rank = 'TC';

-- MJ
UPDATE military_personnel SET seniority = 2 WHERE name = 'MAIA' AND rank = 'MJ';

-- CP
UPDATE military_personnel SET seniority = 3 WHERE name = 'MIRANDA' AND rank = 'CP'; -- Era 'CP' no static, mas banco pode estar 'Cap' se foi alterado manualmente. O script populate usou 'CP'.
UPDATE military_personnel SET seniority = 4 WHERE name = 'CAMILA CALDAS';
UPDATE military_personnel SET seniority = 5 WHERE name = 'FARIAS';
UPDATE military_personnel SET seniority = 6 WHERE name = 'SPINELLI';
UPDATE military_personnel SET seniority = 7 WHERE name = 'ALMEIDA';
UPDATE military_personnel SET seniority = 8 WHERE name = 'JÚNIOR';
UPDATE military_personnel SET seniority = 9 WHERE name = 'FELIPPE MIRANDA';
UPDATE military_personnel SET seniority = 10 WHERE name = 'EDUARDO';
UPDATE military_personnel SET seniority = 11 WHERE name = 'MAIRINK';

-- 1T
UPDATE military_personnel SET seniority = 12 WHERE name = 'ISMAEL' AND rank = '1T';

-- 2T
UPDATE military_personnel SET seniority = 13 WHERE name = 'OBREGON' AND rank = '2T';

-- SO
UPDATE military_personnel SET seniority = 14 WHERE name = 'ELIASAFE' AND rank = 'SO';

-- 1S
UPDATE military_personnel SET seniority = 15 WHERE name = 'MENEZES' AND rank = '1S';
UPDATE military_personnel SET seniority = 16 WHERE name = 'JACOBS' AND rank = '1S';

-- 2S
UPDATE military_personnel SET seniority = 17 WHERE name = 'RIBAS' AND rank = '2S';
UPDATE military_personnel SET seniority = 18 WHERE name = 'EDGAR' AND rank = '2S';
UPDATE military_personnel SET seniority = 19 WHERE name = 'MADUREIRO' AND rank = '2S';
UPDATE military_personnel SET seniority = 20 WHERE name = 'ORIEL' AND rank = '2S';
UPDATE military_personnel SET seniority = 21 WHERE name = 'FRANK' AND rank = '2S';
UPDATE military_personnel SET seniority = 22 WHERE name = 'BRAZ' AND rank = '2S';

-- 3S
UPDATE military_personnel SET seniority = 23 WHERE name = 'PITTIGLIANI' AND rank = '3S';
UPDATE military_personnel SET seniority = 24 WHERE name = 'L. TEIXEIRA' AND rank = '3S';
UPDATE military_personnel SET seniority = 25 WHERE name = 'MAIA' AND rank = '3S';
UPDATE military_personnel SET seniority = 26 WHERE name = 'ANNE' AND rank = '3S';
UPDATE military_personnel SET seniority = 27 WHERE name = 'JAQUES' AND rank = '3S';
UPDATE military_personnel SET seniority = 28 WHERE name = 'HOEHR' AND rank = '3S';
UPDATE military_personnel SET seniority = 29 WHERE name = 'VILELA' AND rank = '3S';
UPDATE military_personnel SET seniority = 30 WHERE name = 'HENRIQUE' AND rank = '3S';

-- S1
UPDATE military_personnel SET seniority = 31 WHERE name = 'NYCOLAS' AND rank = 'S1';
UPDATE military_personnel SET seniority = 32 WHERE name = 'GABRIEL REIS' AND rank = 'S1';

-- S2
UPDATE military_personnel SET seniority = 33 WHERE name = 'DOUGLAS SILVA' AND rank = 'S2';
UPDATE military_personnel SET seniority = 34 WHERE name = 'DA ROSA' AND rank = 'S2';
UPDATE military_personnel SET seniority = 35 WHERE name = 'DENARDIN' AND rank = 'S2';
UPDATE military_personnel SET seniority = 36 WHERE name = 'JOÃO GABRIEL' AND rank = 'S2';
UPDATE military_personnel SET seniority = 37 WHERE name = 'VIEIRA' AND rank = 'S2';

-- Garantir índice para performance
CREATE INDEX IF NOT EXISTS idx_military_seniority ON military_personnel(seniority);

-- Confirmação
DO $$
BEGIN
    RAISE NOTICE 'Coluna seniority adicionada e dados atualizados com sucesso.';
END $$;
