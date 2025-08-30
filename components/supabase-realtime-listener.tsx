"use client"

import { useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { toast } from "sonner"

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

export default function SupabaseRealtimeListener() {
  useEffect(() => {
    // Listen for changes in military_attendance_records
    const attendanceChannel = supabase
      .channel("military_attendance_records_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "military_attendance_records" }, (payload) => {
        console.log("Change received!", payload)
        toast.info(`Atualização de Presença: ${payload.eventType} na tabela de registros de presença.`)
      })
      .subscribe()

    // Listen for changes in military_justifications
    const justificationsChannel = supabase
      .channel("military_justifications_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "military_justifications" }, (payload) => {
        console.log("Change received!", payload)
        toast.info(`Atualização de Justificativa: ${payload.eventType} na tabela de justificativas.`)
      })
      .subscribe()

    // Listen for changes in claviculario_keys
    const keysChannel = supabase
      .channel("claviculario_keys_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "claviculario_keys" }, (payload) => {
        console.log("Change received!", payload)
        toast.info(`Atualização de Chave: ${payload.eventType} na tabela de chaves.`)
      })
      .subscribe()

    // Listen for changes in events
    const eventsChannel = supabase
      .channel("events_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "events" }, (payload) => {
        console.log("Change received!", payload)
        toast.info(`Atualização de Evento: ${payload.eventType} na tabela de eventos.`)
      })
      .subscribe()

    // Listen for changes in flights
    const flightsChannel = supabase
      .channel("flights_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "flights" }, (payload) => {
        console.log("Change received!", payload)
        toast.info(`Atualização de Voo: ${payload.eventType} na tabela de voos.`)
      })
      .subscribe()

    // Listen for changes in personal_notes
    const notesChannel = supabase
      .channel("personal_notes_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "personal_notes" }, (payload) => {
        console.log("Change received!", payload)
        toast.info(`Atualização de Nota Pessoal: ${payload.eventType} na tabela de notas.`)
      })
      .subscribe()

    // Listen for changes in military_personal_checklists
    const checklistsChannel = supabase
      .channel("military_personal_checklists_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "military_personal_checklists" }, (payload) => {
        console.log("Change received!", payload)
        toast.info(`Atualização de Checklist: ${payload.eventType} na tabela de checklists.`)
      })
      .subscribe()

    return () => {
      supabase.removeChannel(attendanceChannel)
      supabase.removeChannel(justificationsChannel)
      supabase.removeChannel(keysChannel)
      supabase.removeChannel(eventsChannel)
      supabase.removeChannel(flightsChannel)
      supabase.removeChannel(notesChannel)
      supabase.removeChannel(checklistsChannel)
    }
  }, [])

  return null
}
