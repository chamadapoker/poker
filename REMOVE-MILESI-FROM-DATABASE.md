# 🗑️ Remoção do S2 MILESI do Sistema

## ✅ Status da Remoção

### **1. Dados Estáticos - REMOVIDO ✅**
- ❌ **S2 MILESI** foi removido do arquivo `lib/static-data.ts`
- ✅ Não aparecerá mais nos dropdowns do sistema
- ✅ Não será mais carregado na lista de presença

### **2. Banco de Dados - LIMPEZA NECESSÁRIA**

Para remover completamente o S2 MILESI do sistema, execute o script SQL no Supabase:

#### **Script SQL para Executar:**

```sql
-- Script para remover S2 MILESI de todas as tabelas
-- Execute no Supabase SQL Editor

-- 1. Remover da tabela military_personnel
DELETE FROM military_personnel 
WHERE name ILIKE '%MILESI%' OR name ILIKE '%milesi%';

-- 2. Remover da tabela military_attendance_records
DELETE FROM military_attendance_records 
WHERE military_name ILIKE '%MILESI%' OR military_name ILIKE '%milesi%';

-- 3. Remover da tabela military_justifications
DELETE FROM military_justifications 
WHERE military_name ILIKE '%MILESI%' OR military_name ILIKE '%milesi%';

-- 4. Remover da tabela daily_permanence_records
DELETE FROM daily_permanence_records 
WHERE military_name ILIKE '%MILESI%' OR military_name ILIKE '%milesi%';

-- 5. Remover da tabela claviculario_movements
DELETE FROM claviculario_movements 
WHERE military_name ILIKE '%MILESI%' OR military_name ILIKE '%milesi%';

-- 6. Verificar se a remoção foi bem-sucedida
SELECT 'Verificação de remoção do MILESI:' as status;

SELECT 'military_personnel' as tabela, COUNT(*) as registros_restantes
FROM military_personnel 
WHERE name ILIKE '%MILESI%' OR name ILIKE '%milesi%';

SELECT 'military_attendance_records' as tabela, COUNT(*) as registros_restantes
FROM military_attendance_records 
WHERE military_name ILIKE '%MILESI%' OR military_name ILIKE '%milesi%';

SELECT 'military_justifications' as tabela, COUNT(*) as registros_restantes
FROM military_justifications 
WHERE military_name ILIKE '%MILESI%' OR military_name ILIKE '%milesi%';

SELECT 'daily_permanence_records' as tabela, COUNT(*) as registros_restantes
FROM daily_permanence_records 
WHERE military_name ILIKE '%MILESI%' OR military_name ILIKE '%milesi%';

SELECT 'claviculario_movements' as tabela, COUNT(*) as registros_restantes
FROM claviculario_movements 
WHERE military_name ILIKE '%MILESI%' OR military_name ILIKE '%milesi%';
```

## 📋 Componentes Afetados

O S2 MILESI foi removido dos seguintes componentes:

### **✅ Presença (Attendance)**
- ❌ Não aparece mais na lista de presença
- ❌ Não aparece nos dropdowns de status

### **✅ Justificativas**
- ❌ Não aparece na lista de militares
- ❌ Não pode receber justificativas

### **✅ Gestão de Chaves**
- ❌ Não aparece na lista de militares
- ❌ Não pode retirar/devolver chaves

### **✅ Eventos**
- ❌ Não aparece na lista de participantes
- ❌ Não pode ser adicionado a eventos

### **✅ Voos**
- ❌ Não aparece na lista de pilotos
- ❌ Não pode ser agendado para voos

### **✅ Checklist de Permanência**
- ❌ Não aparece na lista de militares
- ❌ Não pode ser selecionado para permanência

### **✅ Histórico**
- ❌ Não aparece nos registros históricos
- ❌ Dados históricos serão limpos do banco

## 🚀 Como Executar a Limpeza

### **1. Acesse o Supabase**
- Vá para o [Supabase Dashboard](https://supabase.com/dashboard)
- Selecione seu projeto
- Vá para **SQL Editor**

### **2. Execute o Script**
- Cole o script SQL acima
- Clique em **Run**
- Verifique os resultados

### **3. Confirme a Remoção**
- Todos os registros devem retornar **0** na verificação
- Se algum retornar > 0, execute novamente

## 🔍 Verificação Manual

Após executar o script, verifique:

1. **Lista de Presença** - MILESI não deve aparecer
2. **Dropdowns** - MILESI não deve estar nas opções
3. **Histórico** - Não deve haver registros do MILESI
4. **Justificativas** - MILESI não deve estar na lista

## ⚠️ Importante

- **Backup:** Faça backup antes de executar o script
- **Teste:** Teste em ambiente de desenvolvimento primeiro
- **Verificação:** Confirme que todos os registros foram removidos
- **Logs:** Mantenha logs da remoção para auditoria

## 📞 Suporte

Se houver problemas:
1. Verifique os logs do Supabase
2. Confirme se o script foi executado corretamente
3. Verifique se não há referências em outras tabelas
4. Entre em contato com o suporte técnico
