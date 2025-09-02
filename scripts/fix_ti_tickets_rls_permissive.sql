-- Script para ordenar a coluna 'text' em ordem alfabética
-- Atualiza o order_index baseado na ordem alfabética do texto

-- Primeiro, vamos ver a ordem atual
SELECT id, text, category, order_index 
FROM daily_permanence_checklist 
ORDER BY order_index;

-- Agora vamos atualizar o order_index para ordem alfabética
WITH ordered_checklist AS (
  SELECT 
    id,
    text,
    category,
    ROW_NUMBER() OVER (ORDER BY text ASC) as new_order
  FROM daily_permanence_checklist
  WHERE is_active = true
)
UPDATE daily_permanence_checklist 
SET order_index = ordered_checklist.new_order
FROM ordered_checklist
WHERE daily_permanence_checklist.id = ordered_checklist.id;

-- Verificar o resultado da ordenação alfabética
SELECT 
  id, 
  text, 
  category, 
  order_index,
  is_active
FROM daily_permanence_checklist 
ORDER BY order_index;

-- Comando alternativo mais simples (se preferir):
-- UPDATE daily_permanence_checklist 
-- SET order_index = subquery.new_order
-- FROM (
--   SELECT id, ROW_NUMBER() OVER (ORDER BY text ASC) as new_order
--   FROM daily_permanence_checklist
--   WHERE is_active = true
-- ) AS subquery
-- WHERE daily_permanence_checklist.id = subquery.id;
