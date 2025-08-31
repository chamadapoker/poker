import { createClient } from "@supabase/supabase-js"
import { supabaseConfig } from "./supabase-config"

const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Cliente público para operações do lado do cliente
export const supabase = createClient(supabaseConfig.url, supabaseConfig.anonKey)

// Cliente de serviço para operações do lado do servidor (com permissões elevadas)
export const supabaseAdmin = supabaseServiceRoleKey 
  ? createClient(supabaseConfig.url, supabaseServiceRoleKey)
  : null
