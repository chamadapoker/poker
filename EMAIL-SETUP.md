# 📧 Configuração do Sistema de Email - POKER 360

## 🎯 Funcionalidades

O sistema POKER 360 agora inclui:
- ✅ **Geração automática de PDF** com dados de presença
- ✅ **Download do PDF** para o dispositivo
- ✅ **Envio por email** com PDF anexado
- ✅ **Controle do usuário** para decidir quando enviar
- ✅ **Atualização automática** do PDF a cada salvamento

## ⚙️ Configuração do Email

### 1. Variáveis de Ambiente

Adicione as seguintes variáveis no seu arquivo `.env.local`:

```env
# Configurações de Email
EMAIL_USER=seu-email@gmail.com
EMAIL_PASS=sua-senha-de-app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
```

### 2. Configuração do Gmail

Para usar Gmail como servidor de email:

1. **Ative a verificação em duas etapas** na sua conta Google
2. **Gere uma senha de app**:
   - Vá em "Gerenciar sua Conta Google"
   - Segurança > Verificação em duas etapas
   - Senhas de app > Gerar nova senha
3. **Use a senha gerada** no `EMAIL_PASS`

### 3. Configuração de Outros Provedores

#### Outlook/Hotmail:
```env
EMAIL_USER=seu-email@outlook.com
EMAIL_PASS=sua-senha
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
```

#### Yahoo:
```env
EMAIL_USER=seu-email@yahoo.com
EMAIL_PASS=sua-senha-de-app
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
```

## 🚀 Como Usar

### 1. Salvar Presença
- Configure a presença dos militares
- Clique em **"Salvar Presença"**
- O sistema salva os dados no banco

### 2. Gerar PDF
- Após salvar, aparece o botão **"Gerar PDF"**
- Clique para baixar o documento
- O PDF é gerado automaticamente

### 3. Enviar por Email
- Após gerar o PDF, aparece o botão **"Enviar por Email"**
- Clique para enviar o relatório
- O email é enviado com o PDF anexado

## 📄 Estrutura do PDF

O PDF gerado inclui:

### Cabeçalho
- Nome da unidade militar
- Lema da unidade
- Data e tipo de chamada

### Tabela de Presença
- Posto/Graduação
- Nome do militar
- Status (Presente/Ausente/Justificado)
- Observações

### Resumo
- Total de militares
- Quantidade de presentes
- Quantidade de ausentes
- Quantidade de justificados

### Rodapé
- Informações de geração
- Data e hora

## 📧 Template de Email

O email enviado inclui:

### Assunto
```
Relatório de Presença - DD/MM/AAAA - Tipo de Chamada
```

### Corpo do Email
```
Prezados,

Segue em anexo o relatório de presença do dia DD/MM/AAAA para o tipo de chamada: [TIPO].

Resumo:
- Total de militares: XX
- Presentes: XX
- Ausentes: XX
- Justificados: XX

Atenciosamente,
Sistema POKER 360
```

## 🔧 Personalização

### Emails Destinatários

Edite o arquivo `lib/email-config.ts` para configurar:

```typescript
export const emailConfig = {
  defaultRecipient: 'comando@poker360.com',
  authorizedEmails: [
    'comando@poker360.com',
    'chefe@poker360.com',
    'admin@poker360.com',
  ],
  // ...
}
```

### Templates de Email

Personalize os templates em `lib/email-config.ts`:

```typescript
templates: {
  attendance: {
    subject: 'Relatório de Presença - {date}',
    text: `
Prezados,

Segue em anexo o relatório de presença do dia {date} para o tipo de chamada: {callType}.

Resumo:
- Total de militares: {total}
- Presentes: {present}
- Ausentes: {absent}
- Justificados: {justified}

Atenciosamente,
Sistema POKER 360
    `.trim(),
  },
}
```

## 🛠️ Solução de Problemas

### Erro de Autenticação
- Verifique se a verificação em duas etapas está ativa
- Use uma senha de app, não a senha normal
- Confirme as configurações SMTP

### Erro de Envio
- Verifique se as variáveis de ambiente estão corretas
- Confirme se o email destinatário é válido
- Verifique os logs do servidor

### PDF não Gera
- Verifique se há dados de presença salvos
- Confirme se o tipo de chamada está selecionado
- Verifique o console do navegador para erros

## 🔒 Segurança

- ✅ **Senhas de app** para autenticação segura
- ✅ **Validação de email** antes do envio
- ✅ **Lista de emails autorizados**
- ✅ **Logs de auditoria** para envios

## 📱 Responsividade

O sistema funciona perfeitamente em:
- ✅ **Desktop** - Interface completa
- ✅ **Tablet** - Layout adaptado
- ✅ **Mobile** - Interface otimizada

## 🎉 Benefícios

1. **Automatização** - Geração automática de relatórios
2. **Profissionalismo** - PDFs com layout militar
3. **Controle** - Usuário decide quando enviar
4. **Rastreabilidade** - Histórico de envios
5. **Flexibilidade** - Múltiplos destinatários
6. **Segurança** - Autenticação segura
