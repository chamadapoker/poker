# 🎵 Configuração da Canção no Supabase

## 📋 **Pré-requisitos**
- Projeto Supabase configurado
- Acesso ao SQL Editor do Supabase
- Acesso ao Storage do Supabase
- Arquivo MP3 da canção do Esquadrão POKER

## 🗄️ **Passo 1: Executar Script SQL**

1. **Acesse o Supabase Dashboard**
2. **Vá para SQL Editor**
3. **Execute o script** `scripts/create_cancao_table.sql`

Este script criará:
- ✅ Tabela `cancoes` com metadados
- ✅ Tabela `cancao_downloads` para auditoria
- ✅ Políticas de segurança (RLS)
- ✅ Funções para contadores
- ✅ Inserção da canção do Esquadrão POKER

## 🗂️ **Passo 2: Configurar Storage Bucket**

1. **Vá para Storage no Supabase**
2. **Crie um novo bucket** chamado `cancoes`
3. **Configure as políticas de acesso:**

```sql
-- Permitir leitura pública para usuários autenticados
CREATE POLICY "Usuários autenticados podem ler canções" ON storage.objects
FOR SELECT USING (
  bucket_id = 'cancoes' AND 
  auth.role() = 'authenticated'
);

-- Permitir upload apenas para admins (opcional)
CREATE POLICY "Apenas admins podem fazer upload" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'cancoes' AND 
  auth.role() = 'authenticated' AND
  auth.jwt() ->> 'role' = 'admin'
);
```

## 📁 **Passo 3: Fazer Upload do Arquivo**

1. **No bucket `cancoes`**
2. **Faça upload** do arquivo `cancao-poker.mp3`
3. **Verifique** se o caminho está correto na tabela

## 🔧 **Passo 4: Verificar Configuração**

1. **Execute no SQL Editor:**
```sql
SELECT * FROM cancoes WHERE ativo = true;
```

2. **Verifique se retorna:**
- ✅ ID da canção
- ✅ Título correto
- ✅ Arquivo path correto
- ✅ Status ativo

## 🚀 **Passo 5: Testar a Aplicação**

1. **Acesse** a página `/cancao`
2. **Verifique** se:
   - ✅ Player carrega sem erros
   - ✅ Áudio reproduz corretamente
   - ✅ Download funciona
   - ✅ Contadores atualizam

## 📊 **Funcionalidades Implementadas**

### 🎵 **Player de Áudio**
- ✅ Reprodução com controles
- ✅ Barra de progresso
- ✅ Controle de volume
- ✅ Estados de loading/erro

### 📥 **Sistema de Download**
- ✅ Download seguro via Supabase
- ✅ Registro de downloads
- ✅ Contadores automáticos
- ✅ Auditoria completa

### 🔒 **Segurança**
- ✅ Apenas usuários autenticados
- ✅ Controle de acesso por RLS
- ✅ Rastreamento de downloads
- ✅ Políticas de storage

## 🐛 **Solução de Problemas**

### ❌ **Erro: "Canção não encontrada"**
- Verifique se a tabela foi criada
- Confirme se há registros ativos
- Verifique as políticas RLS

### ❌ **Erro: "Não autorizado"**
- Verifique se o usuário está logado
- Confirme as políticas de storage
- Verifique as variáveis de ambiente

### ❌ **Áudio não reproduz**
- Verifique o caminho do arquivo
- Confirme se o bucket está público
- Verifique as políticas de storage

## 🔧 **Variáveis de Ambiente**

Certifique-se de que estas variáveis estão configuradas:

```env
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima
```

## 📈 **Monitoramento**

### 📊 **Métricas Disponíveis**
- Total de downloads
- Último download
- Usuários que baixaram
- Versões da canção

### 🔍 **Consultas Úteis**
```sql
-- Total de downloads
SELECT downloads_count FROM cancoes WHERE ativo = true;

-- Usuários que baixaram
SELECT 
  u.email,
  cd.downloaded_at
FROM cancao_downloads cd
JOIN auth.users u ON cd.user_id = u.id
ORDER BY cd.downloaded_at DESC;
```

## 🎯 **Próximos Passos**

1. **Teste completo** da funcionalidade
2. **Configuração** de notificações (opcional)
3. **Monitoramento** de uso
4. **Backup** automático dos dados

---

## 🎖️ **Resultado Final**

A canção do Esquadrão POKER agora está:
- ✅ **Segura** no Supabase
- ✅ **Auditável** com rastreamento
- ✅ **Escalável** para toda a base
- ✅ **Profissional** e adequada para uso militar

**Para o Esquadrão POKER!** 🚁✨
