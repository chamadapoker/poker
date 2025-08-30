"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useState } from "react"
import { toast } from "sonner"

interface Flight {
  id: string
  origin: string
  destination: string
  date: string
  status: "agendado" | "concluído" | "cancelado"
}

function FlightScheduler() {
  const [flights, setFlights] = useState<Flight[]>([])
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [date, setDate] = useState("")

  const handleScheduleFlight = (e: React.FormEvent) => {
    e.preventDefault()
    if (!origin || !destination || !date) {
      toast.error("Por favor, preencha todos os campos.")
      return
    }
    const newFlight: Flight = {
      id: `F${(flights.length + 1).toString().padStart(3, "0")}`,
      origin,
      destination,
      date,
      status: "agendado",
    }
    setFlights([...flights, newFlight])
    setOrigin("")
    setDestination("")
    setDate("")
    toast.success("Voo agendado com sucesso!")
  }

  const handleStatusChange = (id: string, newStatus: Flight["status"]) => {
    setFlights(flights.map((flight) => (flight.id === id ? { ...flight, status: newStatus } : flight)))
    toast.info(`Status do voo ${id} atualizado para ${newStatus}.`)
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Agendamento de Voos</CardTitle>
        <CardDescription>Agende e gerencie voos para missões ou transporte.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleScheduleFlight} className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="grid gap-2">
            <Label htmlFor="origin">Origem</Label>
            <Input
              id="origin"
              placeholder="Ex: Base Aérea de Brasília"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="destination">Destino</Label>
            <Input
              id="destination"
              placeholder="Ex: Campo de Provas Brigadeiro Velloso"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="date">Data</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          </div>
          <div className="md:col-span-3">
            <Button type="submit" className="w-full">
              Agendar Voo
            </Button>
          </div>
        </form>

        <h3 className="text-lg font-semibold mb-2">Voos Agendados</h3>
        {flights.length === 0 ? (
          <p className="text-gray-500">Nenhum voo agendado.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Origem</TableHead>
                <TableHead>Destino</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {flights.map((flight) => (
                <TableRow key={flight.id}>
                  <TableCell className="font-medium">{flight.id}</TableCell>
                  <TableCell>{flight.origin}</TableCell>
                  <TableCell>{flight.destination}</TableCell>
                  <TableCell>{flight.date}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        flight.status === "agendado"
                          ? "bg-blue-100 text-blue-800"
                          : flight.status === "concluído"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {flight.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Select
                      value={flight.status}
                      onValueChange={(value: Flight["status"]) => handleStatusChange(flight.id, value)}
                    >
                      <SelectTrigger className="w-[120px] h-8">
                        <SelectValue placeholder="Mudar Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="agendado">Agendado</SelectItem>
                        <SelectItem value="concluído">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

export { FlightScheduler }
export default FlightScheduler
