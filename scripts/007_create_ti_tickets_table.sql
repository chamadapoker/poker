-- Script para criar a tabela de chamados de TI
-- Sistema completo de tickets com upload de imagens, prazos e atribuições

-- Habilitar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela de chamados de TI
CREATE TABLE IF NOT EXISTS ti_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Informações básicas do chamado
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT 'Hardware',
    
    -- Informações do solicitante
    requester_name TEXT NOT NULL,
    requester_rank TEXT,
    
    -- Classificação e prioridade
    urgency_level TEXT NOT NULL DEFAULT 'média' CHECK (urgency_level IN ('baixa', 'média', 'alta', 'crítica')),
    priority TEXT NOT NULL DEFAULT 'média' CHECK (priority IN ('baixa', 'média', 'alta', 'urgente')),
    
    -- Status e atribuição
    status TEXT NOT NULL DEFAULT 'aberto' CHECK (status IN ('aberto', 'em_andamento', 'resolvido', 'fechado')),
    assigned_to TEXT, -- ID do SAU responsável
    
    -- Prazos e datas
    deadline TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    closed_at TIMESTAMP WITH TIME ZONE,
    
    -- Conteúdo adicional
    images TEXT[], -- Array de URLs das imagens
    notes TEXT, -- Observações adicionais
    resolution TEXT, -- Solução aplicada
    
    -- Metadados
    tags TEXT[], -- Tags para categorização
    estimated_hours INTEGER, -- Tempo estimado para resolução
    actual_hours INTEGER -- Tempo real gasto
);

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_ti_tickets_status ON ti_tickets(status);
CREATE INDEX IF NOT EXISTS idx_ti_tickets_urgency ON ti_tickets(urgency_level);
CREATE INDEX IF NOT EXISTS idx_ti_tickets_category ON ti_tickets(category);
CREATE INDEX IF NOT EXISTS idx_ti_tickets_requester ON ti_tickets(requester_name);
CREATE INDEX IF NOT EXISTS idx_ti_tickets_assigned ON ti_tickets(assigned_to);
CREATE INDEX IF NOT EXISTS idx_ti_tickets_created ON ti_tickets(created_at);
CREATE INDEX IF NOT EXISTS idx_ti_tickets_deadline ON ti_tickets(deadline);

-- Criar tabela de histórico de mudanças de status
CREATE TABLE IF NOT EXISTS ti_ticket_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES ti_tickets(id) ON DELETE CASCADE,
    old_status TEXT,
    new_status TEXT NOT NULL,
    changed_by TEXT NOT NULL, -- Quem fez a mudança
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    notes TEXT -- Comentários sobre a mudança
);

-- Criar tabela de comentários nos chamados
CREATE TABLE IF NOT EXISTS ti_ticket_comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES ti_tickets(id) ON DELETE CASCADE,
    author_name TEXT NOT NULL,
    author_rank TEXT,
    comment TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_internal BOOLEAN DEFAULT FALSE -- Se é comentário interno da equipe
);

-- Criar tabela de anexos (imagens, documentos)
CREATE TABLE IF NOT EXISTS ti_ticket_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES ti_tickets(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER, -- Tamanho em bytes
    file_type TEXT, -- Tipo MIME
    uploaded_by TEXT NOT NULL,
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE ti_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ti_ticket_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE ti_ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ti_ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para ti_tickets
CREATE POLICY "ti_tickets_read_all" ON ti_tickets FOR SELECT USING (true);
CREATE POLICY "ti_tickets_insert_all" ON ti_tickets FOR INSERT WITH CHECK (true);
CREATE POLICY "ti_tickets_update_assigned" ON ti_tickets FOR UPDATE USING (
    assigned_to = current_user OR 
    status IN ('aberto', 'em_andamento') -- Qualquer one pode atualizar status básicos
);
CREATE POLICY "ti_tickets_delete_admin" ON ti_tickets FOR DELETE USING (false); -- Não permitir exclusão

-- Políticas RLS para histórico
CREATE POLICY "ti_ticket_history_read_all" ON ti_ticket_history FOR SELECT USING (true);
CREATE POLICY "ti_ticket_history_insert_all" ON ti_ticket_history FOR INSERT WITH CHECK (true);

-- Políticas RLS para comentários
CREATE POLICY "ti_ticket_comments_read_all" ON ti_ticket_comments FOR SELECT USING (true);
CREATE POLICY "ti_ticket_comments_insert_all" ON ti_ticket_comments FOR INSERT WITH CHECK (true);
CREATE POLICY "ti_ticket_comments_update_author" ON ti_ticket_comments FOR UPDATE USING (author_name = current_user);

-- Políticas RLS para anexos
CREATE POLICY "ti_ticket_attachments_read_all" ON ti_ticket_attachments FOR SELECT USING (true);
CREATE POLICY "ti_ticket_attachments_insert_all" ON ti_ticket_attachments FOR INSERT WITH CHECK (true);

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_ti_ticket_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER trigger_update_ti_ticket_updated_at
    BEFORE UPDATE ON ti_tickets
    FOR EACH ROW
    EXECUTE FUNCTION update_ti_ticket_updated_at();

-- Função para registrar histórico de mudanças
CREATE OR REPLACE FUNCTION log_ti_ticket_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status IS DISTINCT FROM NEW.status THEN
        INSERT INTO ti_ticket_history (ticket_id, old_status, new_status, changed_by)
        VALUES (NEW.id, OLD.status, NEW.status, COALESCE(NEW.assigned_to, 'Sistema'));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para registrar mudanças de status
CREATE TRIGGER trigger_log_ti_ticket_status_change
    AFTER UPDATE ON ti_tickets
    FOR EACH ROW
    EXECUTE FUNCTION log_ti_ticket_status_change();

-- Função para verificar prazos vencidos
CREATE OR REPLACE FUNCTION get_overdue_tickets()
RETURNS TABLE (
    ticket_id UUID,
    title TEXT,
    days_overdue INTEGER,
    urgency_level TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.title,
        EXTRACT(DAY FROM (NOW() - t.deadline))::INTEGER as days_overdue,
        t.urgency_level
    FROM ti_tickets t
    WHERE t.deadline < NOW() 
    AND t.status NOT IN ('resolvido', 'fechado')
    ORDER BY t.deadline ASC;
END;
$$ LANGUAGE plpgsql;

-- Inserir dados de exemplo (opcional)
INSERT INTO ti_tickets (
    title, 
    description, 
    category, 
    requester_name, 
    requester_rank, 
    urgency_level, 
    priority, 
    status
) VALUES 
(
    'Impressora não está funcionando',
    'A impressora da sala de reuniões não está respondendo aos comandos de impressão. Aparece mensagem de erro "Dispositivo não encontrado".',
    'Impressora',
    'S1 Silva',
    'S1',
    'média',
    'média',
    'aberto'
),
(
    'Problema de acesso ao sistema',
    'Não consigo acessar o sistema principal. Aparece erro de autenticação mesmo com credenciais corretas.',
    'Sistema',
    'S2 Santos',
    'S2',
    'alta',
    'alta',
    'aberto'
),
(
    'Computador com tela azul',
    'O computador da estação de trabalho está apresentando tela azul constantemente. Já reiniciei mas o problema persiste.',
    'Hardware',
    'S1 Costa',
    'S1',
    'crítica',
    'urgente',
    'em_andamento'
)
ON CONFLICT DO NOTHING;

-- Comentários para documentação
COMMENT ON TABLE ti_tickets IS 'Tabela principal de chamados de TI com sistema completo de tickets';
COMMENT ON COLUMN ti_tickets.urgency_level IS 'Nível de urgência: baixa, média, alta, crítica';
COMMENT ON COLUMN ti_tickets.priority IS 'Prioridade de atendimento: baixa, média, alta, urgente';
COMMENT ON COLUMN ti_tickets.status IS 'Status atual do chamado: aberto, em_andamento, resolvido, fechado';
COMMENT ON COLUMN ti_tickets.images IS 'Array de URLs das imagens anexadas ao chamado';
COMMENT ON COLUMN ti_tickets.deadline IS 'Prazo para resolução do chamado (opcional)';

-- Verificar se as tabelas foram criadas
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name LIKE 'ti_%'
ORDER BY table_name, ordinal_position;
