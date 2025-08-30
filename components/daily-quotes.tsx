"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"

function DailyQuotes() {
  const [quote, setQuote] = useState("A persistência é o caminho do êxito.")

  useEffect(() => {
    // Simula a busca de uma nova citação a cada dia
    const quotes = [
      "A persistência é o caminho do êxito.",
      "O único lugar onde o sucesso vem antes do trabalho é no dicionário.",
      "Grandes coisas são feitas por uma série de pequenas coisas reunidas.",
      "Acredite que você pode e você estará no meio do caminho.",
      "Não espere por oportunidades, crie-as.",
    ]
    const dailyQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setQuote(dailyQuote)
  }, [])

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Citação do Dia</CardTitle>
      </CardHeader>
      <CardContent>
        <blockquote className="text-lg font-semibold italic">&quot;{quote}&quot;</blockquote>
      </CardContent>
    </Card>
  )
}

export { DailyQuotes }
export default DailyQuotes
