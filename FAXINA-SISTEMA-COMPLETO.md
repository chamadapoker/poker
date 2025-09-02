# 🧹 SISTEMA DE FAXINA DAS INSTALAÇÕES - 1º/10º GAV

## 📋 **Visão Geral**

Sistema completo de gestão de limpeza das instalações do 1º/10º GAV, desenvolvido para controlar e monitorar o cronograma de faxina de todas as áreas e setores.

## ✨ **Funcionalidades Principais**

### 🎯 **Gestão de Setores**
- **10 Setores** organizados por responsabilidade
- **Localizações específicas** para cada setor
- **Responsáveis designados** para conferência
- **Hierarquia militar** respeitada

### 📊 **Sistema de Status Inteligente**
- **Código de cores** baseado na data da última limpeza
- **Cálculo automático** de dias desde a última faxina
- **Alertas visuais** para limpezas atrasadas
- **Priorização** de áreas que precisam de atenção

### 🔍 **Filtros e Busca**
- **Filtro por setor** específico
- **Busca por localização** ou conferente
- **Visualização agrupada** por setor
- **Estatísticas em tempo real**

### 📝 **Gestão de Registros**
- **Adicionar** novos registros de faxina
- **Editar** informações existentes
- **Excluir** registros obsoletos
- **Observações** para cada localização

### 📤 **Exportação e Relatórios**
- **Exportação CSV** para análise externa
- **Relatórios detalhados** por setor
- **Histórico completo** de limpezas
- **Auditoria** de conferências

## 🏗️ **Estrutura dos Setores**

### **SETOR 1 - S1 GABRIEL REIS**
- Bar CB/SD - N° 18
- C PIS - N° 63
- Corredor SAP
- Salas Briefing Ouros - N° 36
- Meteoro N° 57

### **SETOR 2 - S2 DA ROSA**
- Bar SO/SGT - N° 8
- Corredor Vestiários
- Patrimônio - N° 17
- Sala Briefing Copas - N° 37
- Auditório - N° 31

### **SETOR 3 - S2 DENARDIN**
- Corredor SOP / AUD
- Vestiário Feminino - N° 16
- CADO - N° 23
- Contra-inteligência - N° 32
- Doutrina - N° 22

### **SETOR 4 - S2 DOUGLAS SILVA**
- Corredor PIS
- Bar OF - N° 4
- Navegação - N° 21
- Inteligência - N° 33/34
- Lixo Sigiloso

### **SETOR 5 - S1 NYCOLAS**
- Vestiário OF - N° 15
- RP - N° 5
- SOP - N° 25
- Sala N° 56
- Guerra Eletrônica - N° 26

### **SETOR 6 - S2 PÍBER**
- Vestiário SO/SGT - N° 14
- SAP - N° 7
- SIPAA - N° 24
- Banheiro Feminino
- CGMASO - N° 28

### **SETOR 7 - S2 JOÃO GABRIEL**
- Vestiário CB/SD - N° 19
- Ajudância - N° 10
- Sala Briefing Paus - N° 35
- Sala N° 61
- Sala N° 58
- Churrasqueira

### **SETOR 8 - S2 VIEIRA**
- Protocolo - N° 9
- Salão Histórico - N° 11
- Lixo Comum
- Escala - N° 27
- Banheiros Auditórios
- Aeromédica - N° 6

### **PERMANÊNCIA (CGPAT)**
- Sala CMT - N° 12
- Quarto Permanência - N° 20
- Hall de Entrada

### **SOB DEMANDA (CGPAT)**
- Área externa

## 🎨 **Sistema de Legenda**

### **Código de Cores**
- 🟢 **Verde** - FAXINA EM D (limpeza no dia atual)
- 🟡 **Amarelo** - FAXINA EM D-1 (limpeza no dia anterior)
- 🟠 **Laranja** - FAXINA EM D-2 (limpeza há 2 dias)
- 🔴 **Vermelho Claro** - FAXINA EM ATÉ D-6 (limpeza há até 6 dias)
- 🔴 **Vermelho Médio** - FAXINA EM ATÉ D-13 (limpeza há até 13 dias)
- 🔴 **Vermelho Escuro** - FAXINA EM D-14 OU ANTES (limpeza há 14+ dias)

### **Prioridades**
1. **Crítica** - D-14 ou mais (vermelho escuro)
2. **Alta** - D-6 a D-13 (vermelho)
3. **Média** - D-2 a D-5 (laranja)
4. **Baixa** - D-1 (amarelo)
5. **Em dia** - D (verde)

## 👥 **Responsabilidades por Setor**

### **Graduados e Oficiais**
- Conferem do seu respectivo setor
- Responsáveis diretos pela verificação
- Atualizam status de limpeza

### **CGPAT (Centro de Gestão de Pessoal e Administração)**
- Vestiários
- Corredores
- Auditório
- Churrasqueira/área externa
- Esquadrilhas
- Setores sem efetivo trabalhando
- Permanência
- Sob demanda

### **CGDAP (Centro de Gestão de Desenvolvimento e Apoio)**
- Salas de estar

### **SAP (Seção de Apoio)**
- Pode conferir na ausência dos responsáveis diretos

## 🛠️ **Tecnologias Utilizadas**

### **Frontend**
- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones
- **date-fns** - Manipulação de datas

### **Backend**
- **Supabase** - Banco de dados e autenticação
- **PostgreSQL** - Banco de dados relacional
- **Row Level Security (RLS)** - Segurança de dados

### **Funcionalidades**
- **Responsivo** - Funciona em desktop e mobile
- **Tema escuro/claro** - Suporte a preferências do usuário
- **Notificações toast** - Feedback visual para ações
- **Validação de dados** - Prevenção de erros
- **Exportação CSV** - Relatórios externos

## 📱 **Interface do Usuário**

### **Header Principal**
- Título destacado com gradiente
- Data de referência atual
- Ícone representativo (calendário)

### **Instruções**
- Card azul com responsabilidades
- Texto explicativo detalhado
- Hierarquia clara de responsabilidades

### **Legenda Visual**
- Grid responsivo de cores
- Explicação de cada status
- Código de cores intuitivo

### **Controles**
- Filtro por setor (dropdown)
- Busca por texto (input)
- Botão de nova faxina
- Exportação CSV

### **Estatísticas**
- Cards por setor
- Contagem de localizações
- Status visual por categoria
- Resumo rápido

### **Tabela Principal**
- Agrupamento por setor
- Colunas organizadas
- Status visual com badges
- Ações de edição/exclusão
- Responsiva para mobile

## 🗄️ **Estrutura do Banco de Dados**

### **Tabela: cleaning_records**
```sql
CREATE TABLE cleaning_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sector VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    last_cleaning_date DATE NOT NULL,
    checked_by VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Índices de Performance**
- `idx_cleaning_records_sector` - Busca por setor
- `idx_cleaning_records_location` - Busca por localização
- `idx_cleaning_records_date` - Busca por data
- `idx_cleaning_records_checked_by` - Busca por conferente
- `idx_cleaning_records_created_at` - Ordenação por criação

### **Segurança (RLS)**
- Políticas para usuários autenticados
- Controle de acesso baseado em roles
- Auditoria de todas as operações

## 🚀 **Como Usar**

### **1. Acessar o Sistema**
- Faça login no sistema POKER 360
- Navegue para "Faxina" no menu lateral
- Visualize o dashboard principal

### **2. Verificar Status**
- Observe os cards de estatísticas
- Identifique setores com limpezas atrasadas
- Use os filtros para focar em áreas específicas

### **3. Adicionar Nova Faxina**
- Clique em "Nova Faxina"
- Selecione o setor responsável
- Escolha a localização específica
- Defina a data da limpeza
- Selecione quem conferiu
- Adicione observações (opcional)

### **4. Editar Registros**
- Clique no ícone de edição (lápis)
- Modifique as informações necessárias
- Salve as alterações

### **5. Exportar Dados**
- Clique em "Exportar CSV"
- Baixe o arquivo com todos os dados
- Use em planilhas ou relatórios externos

## 📊 **Relatórios e Análises**

### **Relatórios por Setor**
- Contagem total de localizações
- Status de limpeza atual
- Histórico de conferências
- Responsáveis designados

### **Análise Temporal**
- Dias desde a última limpeza
- Frequência de limpezas
- Padrões de atraso
- Eficiência por setor

### **Indicadores de Performance**
- Percentual de limpezas em dia
- Tempo médio entre limpezas
- Setores mais eficientes
- Áreas que precisam de atenção

## 🔧 **Manutenção e Suporte**

### **Atualizações Regulares**
- Verificação diária de status
- Atualização de responsabilidades
- Manutenção de localizações
- Backup de dados

### **Suporte Técnico**
- Documentação atualizada
- Scripts SQL de instalação
- Configurações de ambiente
- Troubleshooting comum

## 📈 **Benefícios do Sistema**

### **Para a Organização**
- **Controle centralizado** de limpeza
- **Visibilidade completa** do status
- **Responsabilização clara** por setores
- **Histórico auditável** de ações

### **Para os Usuários**
- **Interface intuitiva** e responsiva
- **Acesso rápido** às informações
- **Notificações visuais** de status
- **Relatórios exportáveis** para análise

### **Para a Gestão**
- **Dashboard executivo** em tempo real
- **Métricas de performance** por setor
- **Identificação de gargalos** operacionais
- **Planejamento estratégico** de recursos

## 🎯 **Próximos Passos**

### **Funcionalidades Futuras**
- **Notificações automáticas** para limpezas atrasadas
- **Calendário visual** de cronogramas
- **Integração com sistemas** externos
- **App mobile** para conferências em campo
- **Relatórios PDF** avançados
- **Dashboard analítico** com gráficos

### **Melhorias Técnicas**
- **Cache inteligente** para performance
- **Sincronização offline** para campo
- **API REST** para integrações
- **Webhooks** para notificações
- **Backup automático** de dados

---

## 📞 **Contato e Suporte**

Para dúvidas, sugestões ou problemas técnicos:
- **Sistema**: POKER 360 - 1º/10º GAV
- **Desenvolvimento**: Equipe de TI
- **Documentação**: Atualizada regularmente

---

*Sistema desenvolvido para o 1º/10º GAV - POKER 360* 🚁✨
