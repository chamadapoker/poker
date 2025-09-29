
-- Script para sincronizar justificativas com registros de presença
-- Data: 2025-09-29T15:28:36.715Z

-- Primeiro, vamos verificar as justificativas existentes
SELECT 
  military_name,
  start_date,
  end_date,
  reason,
  approved,
  created_at
FROM military_justifications 
WHERE approved = true
ORDER BY military_name, start_date;

-- Agora vamos verificar registros de presença que precisam ser atualizados
SELECT 
  mar.military_name,
  mar.date,
  mar.status,
  mar.justification_id,
  mj.reason as justification_reason
FROM military_attendance_records mar
LEFT JOIN military_justifications mj ON mar.justification_id = mj.id
WHERE mar.date >= '2025-09-21' 
  AND mar.date <= '2025-10-11'
ORDER BY mar.military_name, mar.date;

-- Atualizar registros de presença com justificativas válidas
UPDATE military_attendance_records 
SET 
  justification_id = mj.id,
  status = 'justificado'
FROM military_justifications mj
WHERE military_attendance_records.military_name = mj.military_name
  AND military_attendance_records.date >= mj.start_date
  AND military_attendance_records.date <= mj.end_date
  AND mj.approved = true
  AND military_attendance_records.justification_id IS NULL;

-- Verificar resultado
SELECT 
  military_name,
  date,
  status,
  justification_id
FROM military_attendance_records 
WHERE date >= '2025-09-21' 
  AND date <= '2025-10-11'
  AND justification_id IS NOT NULL
ORDER BY military_name, date;
