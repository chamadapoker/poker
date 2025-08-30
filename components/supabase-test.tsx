"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { supabase } from "@/lib/supabase"

export function SupabaseTest() {
  const [connectionStatus, setConnectionStatus] = useState<string>("Testando...")
  const [tables, setTables] = useState<string[]>([])
  const [sampleData, setSampleData] = useState<any>(null)
  const [error, setError] = useState<string>("")

  useEffect(() => {
    testConnection()
  }, [])

  const testConnection = async () => {
    try {
      setConnectionStatus("Conectando...")
      
      // Testa a conexão básica
      const { data, error } = await supabase.from('military_attendance_records').select('count').limit(1)
      
      if (error) {
        throw error
      }

      setConnectionStatus("✅ Conectado com sucesso!")
      
      // Lista as tabelas disponíveis
      await listTables()
      
      // Busca dados de exemplo
      await fetchSampleData()
      
    } catch (err: any) {
      setConnectionStatus("❌ Erro na conexão")
      setError(err.message)
      console.error("Erro na conexão Supabase:", err)
    }
  }

  const listTables = async () => {
    try {
      // Tenta acessar tabelas conhecidas
      const knownTables = [
        'military_attendance_records',
        'military_justifications',
        'military_personnel'
      ]
      
      const availableTables: string[] = []
      
      for (const table of knownTables) {
        try {
          const { data, error } = await supabase.from(table).select('count').limit(1)
          if (!error) {
            availableTables.push(table)
          }
        } catch (e) {
          // Tabela não existe ou não acessível
        }
      }
      
      setTables(availableTables)
    } catch (err) {
      console.error("Erro ao listar tabelas:", err)
    }
  }

  const fetchSampleData = async () => {
    try {
      // Busca dados de exemplo da tabela de presença
      const { data, error } = await supabase
        .from('military_attendance_records')
        .select('*')
        .limit(5)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      setSampleData(data)
    } catch (err) {
      console.error("Erro ao buscar dados de exemplo:", err)
    }
  }

  const testInsert = async () => {
    try {
      const testRecord = {
        military_id: "test-001",
        military_name: "TESTE MILITAR",
        rank: "TESTE",
        call_type: "teste",
        date: new Date().toISOString().split('T')[0],
        status: "teste"
      }

      const { data, error } = await supabase
        .from('military_attendance_records')
        .insert([testRecord])
        .select()

      if (error) {
        throw error
      }

      alert("✅ Teste de inserção realizado com sucesso!")
      await fetchSampleData() // Atualiza os dados
      
    } catch (err: any) {
      alert(`❌ Erro no teste de inserção: ${err.message}`)
    }
  }

  const testDelete = async () => {
    try {
      const { error } = await supabase
        .from('military_attendance_records')
        .delete()
        .eq('military_id', 'test-001')

      if (error) {
        throw error
      }

      alert("✅ Teste de exclusão realizado com sucesso!")
      await fetchSampleData() // Atualiza os dados
      
    } catch (err: any) {
      alert(`❌ Erro no teste de exclusão: ${err.message}`)
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>🧪 Teste de Conexão Supabase</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Status da Conexão */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Status da Conexão:</h3>
          <p className="text-lg">{connectionStatus}</p>
          {error && (
            <p className="text-red-600 mt-2">Erro: {error}</p>
          )}
        </div>

        {/* Tabelas Disponíveis */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Tabelas Disponíveis:</h3>
          {tables.length > 0 ? (
            <ul className="list-disc list-inside space-y-1">
              {tables.map((table) => (
                <li key={table} className="text-green-600">{table}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">Nenhuma tabela encontrada</p>
          )}
        </div>

        {/* Dados de Exemplo */}
        <div className="p-4 border rounded-lg">
          <h3 className="font-semibold mb-2">Dados de Exemplo:</h3>
          {sampleData && sampleData.length > 0 ? (
            <div className="space-y-2">
              <p className="text-green-600">✅ {sampleData.length} registros encontrados</p>
              <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto">
                {JSON.stringify(sampleData, null, 2)}
              </pre>
            </div>
          ) : (
            <p className="text-gray-500">Nenhum dado encontrado</p>
          )}
        </div>

        {/* Botões de Teste */}
        <div className="flex gap-4">
          <Button onClick={testConnection} variant="outline">
            🔄 Testar Conexão
          </Button>
          <Button onClick={testInsert} variant="outline">
            ➕ Testar Inserção
          </Button>
          <Button onClick={testDelete} variant="outline">
            🗑️ Testar Exclusão
          </Button>
        </div>

        {/* Informações do Projeto */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-semibold mb-2">📋 Informações do Projeto:</h3>
          <p><strong>URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Não configurado'}</p>
          <p><strong>Chave Anônima:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Configurada' : '❌ Não configurada'}</p>
          <p><strong>Chave de Serviço:</strong> {process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Configurada' : '❌ Não configurada'}</p>
        </div>

      </CardContent>
    </Card>
  )
}

export default SupabaseTest
