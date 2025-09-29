// Configurações de email para o sistema POKER 360

export const emailConfig = {
  // Emails fixos para envio dos relatórios
  defaultRecipients: [
    'chamdapoker@gmail.com',
    'menezesrmm@fab.com.br',
    'vilelagsv@fab.mil.br'
  ],
  
  // Assunto padrão dos emails
  defaultSubject: 'Relatório de Presença - Esquadrão Poker',
  
  // Texto padrão do corpo do email
  defaultText: 'Segue em anexo o relatório de presença do dia.',
  
  // Configurações do servidor de email
  smtp: {
    service: 'gmail', // ou 'outlook', 'yahoo', etc.
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true para 465, false para outras portas
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  },
  
  // Lista de emails autorizados para receber relatórios
  authorizedEmails: [
    'chamdapoker@gmail.com',
    'menezesrmm@fab.com.br',
    'vilelagsv@fab.mil.br',
    'comando@poker360.com',
    'chefe@poker360.com',
    'admin@poker360.com',
  ],
  
  // Configurações de template de email
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
  },
}

// Função para validar email
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Função para obter emails configurados
export function getEmailRecipients(): string[] {
  return emailConfig.defaultRecipients
}

// Função para formatar assunto do email
export function formatEmailSubject(date: string, callType?: string): string {
  let subject = emailConfig.templates.attendance.subject.replace('{date}', date)
  if (callType) {
    subject += ` - ${callType}`
  }
  return subject
}

// Função para formatar texto do email
export function formatEmailText(date: string, callType: string, stats: {
  total: number
  present: number
  absent: number
  justified: number
}): string {
  return emailConfig.templates.attendance.text
    .replace('{date}', date)
    .replace('{callType}', callType)
    .replace('{total}', stats.total.toString())
    .replace('{present}', stats.present.toString())
    .replace('{absent}', stats.absent.toString())
    .replace('{justified}', stats.justified.toString())
}
