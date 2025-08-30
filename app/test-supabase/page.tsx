import { SupabaseTest } from "@/components/supabase-test"

export default function TestSupabasePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">🧪 Teste de Integração Supabase</h1>
        <p className="text-muted-foreground">
          Esta página testa a conexão com o Supabase e verifica se os dados estão sendo puxados corretamente.
        </p>
      </div>
      
      <SupabaseTest />
    </div>
  )
}
