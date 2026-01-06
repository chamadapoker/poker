"use client"

import { useState } from 'react'
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer'
import { Button } from '@/components/ui/button'
import { Mail, Download, Send } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// Estilos para o PDF
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#ffffff',
    padding: 30,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    textAlign: 'center',
    borderBottom: '2px solid #1e40af',
    paddingBottom: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#dc2626', // Vermelho
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 5,
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
  },
  table: {
    width: 'auto',
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: '#d1d5db',
    marginTop: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#d1d5db',
    minHeight: 35,
    alignItems: 'center',
  },
  tableHeader: {
    backgroundColor: '#1e40af',
    color: '#ffffff',
    fontWeight: 'bold',
  },
  tableCell: {
    flex: 1,
    padding: 8,
    fontSize: 10,
    textAlign: 'center',
  },
  tableCellLeft: {
    flex: 2, // Mais espaço para o nome completo
    padding: 8,
    fontSize: 10,
    textAlign: 'left',
  },
  tableCellName: {
    flex: 2, // Mais espaço para o nome completo
    padding: 8,
    fontSize: 10,
    textAlign: 'left',
  },
  summary: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f3f4f6',
    borderRadius: 5,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1e40af',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 12,
    color: '#374151',
  },
  footer: {
    marginTop: 30,
    textAlign: 'center',
    fontSize: 10,
    color: '#6b7280',
    borderTop: '1px solid #d1d5db',
    paddingTop: 10,
  },
})

interface MilitaryAttendance {
  id: string
  militaryId: string
  militaryName: string
  rank: string
  status: string
  callType: string
  date: string
  isJustified: boolean
  justificationReason?: string // Motivo da justificativa
}

interface PDFGeneratorProps {
  militaryAttendance: MilitaryAttendance[]
  selectedCallType: string
  callTypes: Array<{ id: string; label: string }>
  attendanceStatuses: Array<{ id: string; label: string }>
}

// Componente do PDF
const AttendancePDF = ({ 
  militaryAttendance, 
  selectedCallType, 
  callTypes, 
  attendanceStatuses 
}: PDFGeneratorProps) => {
  const today = format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  const callTypeLabel = callTypes.find(t => t.id === selectedCallType)?.label || 'Não definido'
  
  // Calcular estatísticas
  const total = militaryAttendance.length
  const present = militaryAttendance.filter(m => m.status === 'presente').length
  const absent = militaryAttendance.filter(m => m.status === 'ausente').length
  const justified = militaryAttendance.filter(m => m.isJustified).length
  const late = militaryAttendance.filter(m => m.status === 'late').length

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <View style={styles.header}>
          <Text style={styles.title}>1º ESQUADRÃO DO 10º GRUPO DE AVIAÇÃO</Text>
          <Text style={styles.subtitle}>"DA PÁTRIA OS OLHOS ... NA GUERRA E NA PAZ..."</Text>
          <Text style={styles.title}>CONTROLE DE PRESENÇA</Text>
          <Text style={styles.date}>Data: {today}</Text>
          <Text style={styles.date}>Tipo de Chamada: {callTypeLabel}</Text>
        </View>

        {/* Tabela de Presença */}
        <View style={styles.table}>
          {/* Cabeçalho da tabela */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.tableCellName}>Nome</Text>
            <Text style={styles.tableCell}>Status</Text>
            <Text style={styles.tableCell}>Observações</Text>
          </View>

          {/* Dados dos militares */}
          {militaryAttendance.map((military, index) => {
            let statusLabel = attendanceStatuses.find(s => s.id === military.status)?.label || military.status
            let observation = ''
            
            // Se for justificado, mostrar "JUSTIFICADO" em maiúsculo no status
            if (military.isJustified) {
              statusLabel = 'JUSTIFICADO'
              // Usar o motivo da justificativa se disponível
              observation = military.justificationReason || 'JUSTIFICADO'
            }
            
            return (
              <View key={military.id} style={styles.tableRow}>
                <Text style={styles.tableCellName}>{military.rank} {military.militaryName}</Text>
                <Text style={styles.tableCell}>{statusLabel}</Text>
                <Text style={styles.tableCell}>{observation}</Text>
              </View>
            )
          })}
        </View>

        {/* Resumo */}
        <View style={styles.summary}>
          <Text style={styles.summaryTitle}>RESUMO</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Total de Militares:</Text>
            <Text style={styles.summaryText}>{total}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Presentes:</Text>
            <Text style={styles.summaryText}>{present}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Ausentes:</Text>
            <Text style={styles.summaryText}>{absent}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Atrasados:</Text>
            <Text style={styles.summaryText}>{late}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryText}>Justificados:</Text>
            <Text style={styles.summaryText}>{justified}</Text>
          </View>
        </View>

        {/* Rodapé */}
        <View style={styles.footer}>
          <Text>Documento gerado automaticamente pelo Sistema POKER 360</Text>
          <Text>Data e hora de geração: {format(new Date(), "dd/MM/yyyy 'às' HH:mm:ss")}</Text>
        </View>
      </Page>
    </Document>
  )
}

export function PDFGenerator({ 
  militaryAttendance, 
  selectedCallType, 
  callTypes, 
  attendanceStatuses 
}: PDFGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [showEmailButton, setShowEmailButton] = useState(false)

  // Gerar PDF
  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      const blob = await pdf(<AttendancePDF 
        militaryAttendance={militaryAttendance}
        selectedCallType={selectedCallType}
        callTypes={callTypes}
        attendanceStatuses={attendanceStatuses}
      />).toBlob()
      
      // Criar URL do blob
      const url = URL.createObjectURL(blob)
      
      // Download automático
      const link = document.createElement('a')
      link.href = url
      link.download = `presenca_${format(new Date(), 'dd-MM-yyyy')}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      // Limpar URL
      URL.revokeObjectURL(url)
      
      setShowEmailButton(true)
      toast({
        title: "PDF Gerado!",
        description: "O documento foi baixado com sucesso.",
      })
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Enviar por email
  const sendEmail = async () => {
    setIsSending(true)
    try {
      // Gerar PDF novamente para envio
      const blob = await pdf(<AttendancePDF 
        militaryAttendance={militaryAttendance}
        selectedCallType={selectedCallType}
        callTypes={callTypes}
        attendanceStatuses={attendanceStatuses}
      />).toBlob()
      
      // Converter blob para base64
      const arrayBuffer = await blob.arrayBuffer()
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
      
      // Calcular estatísticas
      const total = militaryAttendance.length
      const present = militaryAttendance.filter(m => m.status === 'presente').length
      const absent = militaryAttendance.filter(m => m.status === 'ausente').length
      const justified = militaryAttendance.filter(m => m.isJustified).length

      // Enviar para API
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject: `Relatório de Presença - ${format(new Date(), 'dd/MM/yyyy')}`,
          text: `Segue em anexo o relatório de presença do dia ${format(new Date(), 'dd/MM/yyyy')} para o tipo de chamada: ${callTypes.find(t => t.id === selectedCallType)?.label}`,
          pdfBuffer: base64,
          pdfName: `presenca_${format(new Date(), 'dd-MM-yyyy')}.pdf`,
          callType: callTypes.find(t => t.id === selectedCallType)?.label,
          stats: { total, present, absent, justified }
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Email Enviado!",
          description: "O PDF foi enviado para o email configurado.",
        })
      } else {
        throw new Error(result.error || 'Erro ao enviar email')
      }
    } catch (error) {
      console.error('Erro ao enviar email:', error)
      toast({
        title: "Erro",
        description: "Não foi possível enviar o email. Verifique as configurações.",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full">
      <Button
        onClick={generatePDF}
        disabled={isGenerating || militaryAttendance.length === 0}
        className="flex-1 h-12 sm:h-14 text-sm sm:text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
      >
        <Download className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
        {isGenerating ? 'Gerando PDF...' : 'Gerar PDF'}
      </Button>

      {showEmailButton && (
        <Button
          onClick={sendEmail}
          disabled={isSending}
          variant="outline"
          className="flex-1 h-12 sm:h-14 text-sm sm:text-base font-semibold border-green-600 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Mail className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          {isSending ? 'Enviando...' : 'Enviar por Email'}
        </Button>
      )}
    </div>
  )
}
