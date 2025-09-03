import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { emailConfig, isValidEmail, formatEmailSubject, formatEmailText, getEmailRecipients } from '@/lib/email-config'

export async function POST(request: NextRequest) {
  try {
    const { to, subject, text, pdfBuffer, pdfName, callType, stats } = await request.json()

    // Usar emails fixos configurados
    const recipientEmails = getEmailRecipients()
    
    // Validar emails
    for (const email of recipientEmails) {
      if (!isValidEmail(email)) {
        return NextResponse.json(
          { success: false, error: `Email inválido: ${email}` },
          { status: 400 }
        )
      }
    }

    // Configuração do transporter
    const transporter = nodemailer.createTransport(emailConfig.smtp)

    // Formatar assunto e texto do email
    const emailSubject = subject || formatEmailSubject(new Date().toLocaleDateString('pt-BR'), callType)
    const emailText = text || formatEmailText(
      new Date().toLocaleDateString('pt-BR'), 
      callType || 'Não definido',
      stats || { total: 0, present: 0, absent: 0, justified: 0 }
    )

    // Configuração do email
    const mailOptions = {
      from: emailConfig.smtp.auth.user,
      to: recipientEmails.join(', '), // Enviar para múltiplos destinatários
      subject: emailSubject,
      text: emailText,
      attachments: [
        {
          filename: pdfName || 'presenca.pdf',
          content: Buffer.from(pdfBuffer, 'base64'),
          contentType: 'application/pdf',
        },
      ],
    }

    // Enviar email
    const info = await transporter.sendMail(mailOptions)

    return NextResponse.json({ 
      success: true, 
      messageId: info.messageId,
      message: 'Email enviado com sucesso!' 
    })

  } catch (error) {
    console.error('Erro ao enviar email:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao enviar email',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      },
      { status: 500 }
    )
  }
}
