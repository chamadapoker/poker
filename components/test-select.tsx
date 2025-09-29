"use client"

import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TestSelect() {
  const [value, setValue] = useState("")

  const options = [
    { id: "1", name: "Opção 1" },
    { id: "2", name: "Opção 2" },
    { id: "3", name: "Opção 3" },
  ]

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-bold">Teste do Select</h2>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Selecione uma opção:</label>
        
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione uma opção" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.id} value={option.id}>
                {option.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <p className="text-sm text-gray-600">
          Valor selecionado: {value || "Nenhum"}
        </p>
      </div>
    </div>
  )
}
