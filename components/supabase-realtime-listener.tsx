"use client"

import { useEffect } from "react"
import { supabase } from "../lib/supabase"
import { toast } from "sonner" // Changed to match local usage if sonner is used, or hook toast.
// The original used "import { toast } from 'sonner'". Assuming this is correct package.

export default function SupabaseRealtimeListener() {
  useEffect(() => {
    console.log('🔌 Inicializando Supabase Realtime (Canal Único)...')

    // Single channel for all mutations
    const globalChannel = supabase
      .channel("global_system_changes")

      // Attendance
      .on("postgres_changes", { event: "*", schema: "public", table: "military_attendance_records" }, (payload) => {
        console.log("Change received (attendance)!", payload)
        // toast.info(`Atualização de Presença recebida`) // Reduced noise
      })

      // Justifications
      .on("postgres_changes", { event: "*", schema: "public", table: "military_justifications" }, (payload) => {
        console.log("Change received (justifications)!", payload)
      })

      // Keys
      .on("postgres_changes", { event: "*", schema: "public", table: "claviculario_keys" }, (payload) => {
        console.log("Change received (keys)!", payload)
      })

      // Events
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, (payload) => {
        console.log("Change received (events)!", payload)
      })

      // Flights
      .on("postgres_changes", { event: "*", schema: "public", table: "flights" }, (payload) => {
        console.log("Change received (flights)!", payload)
      })

      // Personal Notes
      .on("postgres_changes", { event: "*", schema: "public", table: "personal_notes" }, (payload) => {
        console.log("Change received (notes)!", payload)
      })

      // Checklists
      .on("postgres_changes", { event: "*", schema: "public", table: "military_personal_checklists" }, (payload) => {
        console.log("Change received (checklists)!", payload)
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('✅ Supabase Realtime conectado!')
        }
      })

    return () => {
      console.log('🔌 Desconectando Supabase Realtime...')
      supabase.removeChannel(globalChannel)
    }
  }, [])

  return null
}
