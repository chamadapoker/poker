import { createClient } from "@supabase/supabase-js"
import { supabaseConfig } from "./supabase-config"

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Singleton para evitar múltiplas instâncias
let supabaseInstance: ReturnType<typeof createClient> | null = null
let supabaseAdminInstance: ReturnType<typeof createClient> | null = null

// Cliente público para operações do lado do cliente (singleton)
export const supabase = (() => {
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseConfig.url, supabaseConfig.anonKey)
    console.log('🔧 Supabase client criado (singleton)')
  }
  return supabaseInstance
})()

// Cliente de serviço para operações do lado do servidor (singleton)
export const supabaseAdmin = (() => {
  if (!supabaseAdminInstance && supabaseServiceRoleKey) {
    supabaseAdminInstance = createClient(supabaseConfig.url, supabaseServiceRoleKey)
    console.log('🔧 Supabase admin client criado (singleton)')
  }
  return supabaseAdminInstance
})()
