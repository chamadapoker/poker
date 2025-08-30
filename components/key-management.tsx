"use client"

import type React from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { useState } from "react"

function KeyManagement() {
  const [keyId, setKeyId] = useState("")
  const [status, setStatus] = useState("")
  const [responsible, setResponsible] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Gerenciamento de Chaves:", { keyId, status, responsible })
    // Lógica para gerenciar chaves
    setKeyId("")
    setStatus("")
    setResponsible("")
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Gerenciamento de Chaves</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="keyId">ID da Chave</Label>
            <Input
              id="keyId"
              type="text"
              value={keyId}
              onChange={(e) => setKeyId(e.target.value)}
              placeholder="Ex: CHAVE001"
            />
          </div>
          <div>
            <Label htmlFor="status">Status</Label>
            <Input
              id="status"
              type="text"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              placeholder="Ex: Disponível, Em Uso, Manutenção"
            />
          </div>
          <div>
            <Label htmlFor="responsible">Responsável</Label>
            <Input
              id="responsible"
              type="text"
              value={responsible}
              onChange={(e) => setResponsible(e.target.value)}
              placeholder="Nome do militar"
            />
          </div>
          <Button type="submit" className="w-full">
            Atualizar Chave
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

export { KeyManagement }
export default KeyManagement
