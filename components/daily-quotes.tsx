"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Quote } from "lucide-react"
import { useState, useEffect } from "react"

export function DailyQuotes() {
  const [currentQuote, setCurrentQuote] = useState("")

  const quotes = [
    "A disciplina é a ponte entre metas e realizações.",
    "A excelência não é um ato, mas um hábito.",
    "O sucesso é a soma de pequenos esforços repetidos dia após dia.",
    "A coragem não é a ausência do medo, mas a conquista sobre ele.",
    "A liderança é ação, não posição.",
    "A união faz a força, a disciplina faz a excelência.",
    "Cada dia é uma nova oportunidade para ser melhor.",
    "A persistência é o caminho do êxito.",
    "A confiança vem da preparação e da prática.",
    "O compromisso com a excelência é uma escolha diária."
  ]

  useEffect(() => {
    // Seleciona uma frase baseada na data do dia
    const today = new Date().getDate()
    const quoteIndex = today % quotes.length
    setCurrentQuote(quotes[quoteIndex])
  }, [quotes.length])

  return (
    <Card className="w-full bg-gradient-to-r from-red-50 to-blue-50 dark:from-red-950/20 dark:to-blue-950/40 border-red-200 dark:border-red-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
              <Quote className="h-5 w-5 text-white" />
            </div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-1">
              Frase do Dia
            </h3>
            <p className="text-xl font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
              "{currentQuote}"
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
