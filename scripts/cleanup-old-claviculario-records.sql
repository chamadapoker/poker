-- 🧹 SCRIPT DE LIMPEZA AUTOMÁTICA - CLAVICULÁRIO
-- Remove registros antigos (mais de 360 dias) da tabela claviculario_movements
-- Este script pode ser executado manualmente ou configurado como job automático

-- 📊 VERIFICAR REGISTROS ANTIGOS ANTES DA LIMPEZA
SELECT 
    'Registros antigos encontrados' as info,
    COUNT(*) as total_registros,
    MIN(action_at) as data_mais_antiga,
    MAX(action_at) as data_mais_recente,
    NOW() - INTERVAL '360 days' as limite_limpeza
FROM claviculario_movements 
WHERE action_at < NOW() - INTERVAL '360 days';

-- 🗑️ LIMPEZA AUTOMÁTICA - REMOVER REGISTROS MAIS ANTIGOS QUE 360 DIAS
DELETE FROM claviculario_movements 
WHERE action_at < NOW() - INTERVAL '360 days';

-- ✅ VERIFICAR RESULTADO DA LIMPEZA
SELECT 
    'Limpeza concluída' as status,
    COUNT(*) as registros_restantes,
    MIN(action_at) as data_mais_antiga_restante,
    MAX(action_at) as data_mais_recente_restante
FROM claviculario_movements;

-- 🔄 CONFIGURAÇÃO PARA EXECUÇÃO AUTOMÁTICA (OPCIONAL)
-- Para configurar limpeza automática no Supabase, use:

/*
-- 1. Criar função de limpeza
CREATE OR REPLACE FUNCTION cleanup_old_claviculario_records()
RETURNS void AS $$
BEGIN
    DELETE FROM claviculario_movements 
    WHERE action_at < NOW() - INTERVAL '360 days';
    
    -- Log da limpeza
    RAISE NOTICE 'Limpeza automática executada em %', NOW();
END;
$$ LANGUAGE plpgsql;

-- 2. Configurar job automático (executar a cada 7 dias)
-- No Supabase Dashboard > Database > Functions > Scheduled Functions
-- Cron: 0 2 * * 0 (todo domingo às 2h da manhã)
-- Function: cleanup_old_claviculario_records()
*/
