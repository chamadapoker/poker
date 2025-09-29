-- =====================================================
-- SCRIPT PARA ORDENAR CHECKLIST EM ORDEM ALFABÉTICA
-- =====================================================
-- Este script ordena a coluna 'text' da tabela checklist_items
-- em ordem alfabética, atualizando o campo order_index

-- 1. VISUALIZAR ORDEM ATUAL
-- =====================================================
SELECT 
  id, 
  text, 
  category, 
  order_index,
  is_active
FROM checklist_items 
ORDER BY order_index;

-- 2. ADICIONAR NOVOS ITENS (se não existirem)
-- =====================================================
-- Adicionar "Verificar e organizar o Claviculário"
INSERT INTO checklist_items (text, category, is_active, order_index)
SELECT 'Verificar e organizar o Claviculário', 'Administrativo', true, 0
WHERE NOT EXISTS (
  SELECT 1 FROM checklist_items 
  WHERE text = 'Verificar e organizar o Claviculário'
);

-- Adicionar "Desligar todas as luzes e demais equipamentos do esquadrão"
INSERT INTO checklist_items (text, category, is_active, order_index)
SELECT 'Desligar todas as luzes e demais equipamentos do esquadrão', 'Infraestrutura', true, 0
WHERE NOT EXISTS (
  SELECT 1 FROM checklist_items 
  WHERE text = 'Desligar todas as luzes e demais equipamentos do esquadrão'
);

-- 3. ATUALIZAR ORDER_INDEX PARA ORDEM ALFABÉTICA
-- =====================================================
WITH ordered_checklist AS (
  SELECT 
    id,
    text,
    category,
    ROW_NUMBER() OVER (ORDER BY text ASC) as new_order
  FROM checklist_items
  WHERE is_active = true
)
UPDATE checklist_items 
SET order_index = ordered_checklist.new_order
FROM ordered_checklist
WHERE checklist_items.id = ordered_checklist.id;

-- 4. VERIFICAR RESULTADO FINAL
-- =====================================================
SELECT 
  id, 
  text, 
  category, 
  order_index,
  is_active
FROM checklist_items 
ORDER BY order_index;

-- 5. COMANDO ALTERNATIVO (MAIS SIMPLES)
-- =====================================================
-- Se preferir uma abordagem mais direta:
/*
UPDATE checklist_items 
SET order_index = subquery.new_order
FROM (
  SELECT id, ROW_NUMBER() OVER (ORDER BY text ASC) as new_order
  FROM checklist_items
  WHERE is_active = true
) AS subquery
WHERE checklist_items.id = subquery.id;
*/

-- 6. VERIFICAR SE A ORDENAÇÃO ESTÁ CORRETA
-- =====================================================
-- Deve mostrar os itens em ordem alfabética (incluindo os novos):
-- - "Astear bandeira do Brasil / CMT ou MAJ"
-- - "Desligar todas as luzes e demais equipamentos do esquadrão"
-- - "Limpar a sala do CMT"
-- - "Manter o Hall de entrada limpo"
-- - "Passar café dos Oficiais"
-- - "Verificar a agenda do Auditório"
-- - "Verificar a escala de serviço do esquadrão"
-- - "Verificar a escala de voo"
-- - "Verificar a sala 33 - Em queda de energia LIGAR o PC"
-- - "Verificar as portas de entrada e saída do esquadrão"
-- - "Verificar e organizar o Claviculário"
-- - "Verificar o servidor - Ar Condicionado ligado sempre"
-- - "Verificar iPads de voo"
