import { supabase } from "./supabase"
import { unstable_noStore as noStore } from "next/cache"
import type {
  MilitaryPersonnel,
  DailyPermanenceRecord,
  MilitaryAttendanceRecord,
  MilitaryJustification,
  ClavicularioKey,
  ClavicularioHistory,
  Event,
  Flight,
  PersonalNote,
  MilitaryPersonalChecklistTemplate,
  ChecklistTemplateItem,
  MilitaryPersonalChecklist,
  ChecklistItemStatus,
} from "./types"

// Fetch Military Personnel
export async function fetchMilitaryPersonnel(): Promise<MilitaryPersonnel[]> {
  noStore()
  try {
    const { data, error } = await (supabase as any).from("military_personnel").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Database Error:", error)
      throw new Error("Failed to fetch military personnel.")
    }
    return data as MilitaryPersonnel[]
  } catch (error) {
    console.error("Failed to fetch military personnel:", error)
    throw new Error("Failed to fetch military personnel.")
  }
}

// Fetch Daily Permanence Records
export async function fetchDailyPermanenceRecords(): Promise<DailyPermanenceRecord[]> {
  noStore()
  try {
    const { data, error } = await supabase
      .from("daily_permanence_records")
      .select("*")
      .order("date", { ascending: false })

    if (error) {
      console.error("Database Error:", error)
      throw new Error("Failed to fetch daily permanence records.")
    }
    return data as DailyPermanenceRecord[]
  } catch (error) {
    console.error("Failed to fetch daily permanence records:", error)
    throw new Error("Failed to fetch daily permanence records.")
  }
}

// Fetch Military Attendance Records
export async function fetchMilitaryAttendanceRecords(): Promise<MilitaryAttendanceRecord[]> {
  noStore()
  try {
    const { data, error } = await (supabase as any)
      .from("military_attendance_records")
      .select("*")
      .order("date", { ascending: false })

    if (error) {
      console.error("Database Error:", error)
      throw new Error("Failed to fetch military attendance records.")
    }
    return data as MilitaryAttendanceRecord[]
  } catch (error) {
    console.error("Failed to fetch military attendance records:", error)
    throw new Error("Failed to fetch military attendance records.")
  }
}

// Fetch Military Justifications
export async function fetchMilitaryJustifications(): Promise<MilitaryJustification[]> {
  noStore()
  try {
    const { data, error } = await supabase
      .from("military_justifications")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database Error:", error)
      throw new Error("Failed to fetch military justifications.")
    }
    return data as MilitaryJustification[]
  } catch (error) {
    console.error("Failed to fetch military justifications:", error)
    throw new Error("Failed to fetch military justifications.")
  }
}

// Fetch Claviculario Keys
export async function fetchClavicularioKeys(): Promise<ClavicularioKey[]> {
  noStore()
  try {
    const { data, error } = await (supabase as any).from("claviculario_keys").select("*").order("key_name", { ascending: true })

    if (error) {
      console.error("Database Error:", error)
      throw new Error("Failed to fetch claviculario keys.")
    }
    return data as ClavicularioKey[]
  } catch (error) {
    console.error("Failed to fetch claviculario keys:", error)
    throw new Error("Failed to fetch claviculario keys.")
  }
}

// Fetch Claviculario History
export async function fetchClavicularioHistory(): Promise<ClavicularioHistory[]> {
  noStore()
  try {
    const { data, error } = await supabase
      .from("claviculario_history")
      .select("*")
      .order("action_at", { ascending: false })

    if (error) {
      console.error("Database Error:", error)
      throw new Error("Failed to fetch claviculario history.")
    }
    return data as ClavicularioHistory[]
  } catch (error) {
    console.error("Failed to fetch claviculario history:", error)
    throw new Error("Failed to fetch claviculario history.")
  }
}

// Fetch Events
export async function fetchEvents(): Promise<Event[]> {
  noStore()
  try {
    const { data, error } = await (supabase as any).from("events").select("*").order("start_time", { ascending: true })

    if (error) {
      console.error("Database Error:", error)
      throw new Error("Failed to fetch events.")
    }
    return data as Event[]
  } catch (error) {
    console.error("Failed to fetch events:", error)
    throw new Error("Failed to fetch events.")
  }
}

// Fetch Flights
export async function fetchFlights(): Promise<Flight[]> {
  noStore()
  try {
    const { data, error } = await (supabase as any).from("flights").select("*").order("departure_time", { ascending: false })

    if (error) {
      console.error("Database Error:", error)
      throw new Error("Failed to fetch flights.")
    }
    return data as Flight[]
  } catch (error) {
    console.error("Failed to fetch flights:", error)
    throw new Error("Failed to fetch flights.")
  }
}

// Fetch Personal Notes
export async function fetchPersonalNotes(): Promise<PersonalNote[]> {
  noStore()
  try {
    const { data, error } = await (supabase as any).from("personal_notes").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("Database Error:", error)
      throw new Error("Failed to fetch personal notes.")
    }
    return data as PersonalNote[]
  } catch (error) {
    console.error("Failed to fetch personal notes:", error)
    throw new Error("Failed to fetch personal notes.")
  }
}

// Fetch Military Personal Checklist Templates
export async function fetchMilitaryPersonalChecklistTemplates(): Promise<MilitaryPersonalChecklistTemplate[]> {
  noStore()
  try {
    const { data, error } = await supabase
      .from("military_personal_checklist_templates")
      .select("*")
      .order("template_name", { ascending: true })

    if (error) {
      console.error("Database Error:", error)
      throw new Error("Failed to fetch checklist templates.")
    }
    return data as MilitaryPersonalChecklistTemplate[]
  } catch (error) {
    console.error("Failed to fetch checklist templates:", error)
    throw new Error("Failed to fetch checklist templates.")
  }
}

// Fetch Checklist Template Items for a given template_id
export async function fetchChecklistTemplateItems(templateId: string): Promise<ChecklistTemplateItem[]> {
  noStore()
  try {
    const { data, error } = await supabase
      .from("checklist_template_items")
      .select("*")
      .eq("template_id", templateId)
      .order("item_order", { ascending: true })

    if (error) {
      console.error("Database Error:", error)
      throw new Error("Failed to fetch checklist template items.")
    }
    return data as ChecklistTemplateItem[]
  } catch (error) {
    console.error("Failed to fetch checklist template items:", error)
    throw new Error("Failed to fetch checklist template items.")
  }
}

// Fetch Military Personal Checklists
export async function fetchMilitaryPersonalChecklists(): Promise<MilitaryPersonalChecklist[]> {
  noStore()
  try {
    const { data, error } = await supabase
      .from("military_personal_checklists")
      .select("*")
      .order("checklist_date", { ascending: false })

    if (error) {
      console.error("Database Error:", error)
      throw new Error("Failed to fetch military personal checklists.")
    }
    return data as MilitaryPersonalChecklist[]
  } catch (error) {
    console.error("Failed to fetch military personal checklists:", error)
    throw new Error("Failed to fetch military personal checklists.")
  }
}

// Fetch Checklist Items Status for a given checklist_id
export async function fetchChecklistItemsStatus(checklistId: string): Promise<ChecklistItemStatus[]> {
  noStore()
  try {
    const { data, error } = await supabase
      .from("checklist_items_status")
      .select("*")
      .eq("checklist_id", checklistId)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Database Error:", error)
      throw new Error("Failed to fetch checklist items status.")
    }
    return data as ChecklistItemStatus[]
  } catch (error) {
    console.error("Failed to fetch checklist items status:", error)
    throw new Error("Failed to fetch checklist items status.")
  }
}

/**
 * Este arquivo continua a existir para retro-compatibilidade.
 * Reexporta os dados estáticos definidos em `static-data.ts`.
 */
export {
  militaryPersonnel,
  callTypes,
  absenceReasons,
} from "./static-data"

// Dashboard Analytics Functions

// Fetch Total Military Personnel Count
export async function fetchTotalMilitaryPersonnel(): Promise<number> {
  noStore()
  try {
    const { count, error } = await supabase
      .from("military_personnel")
      .select("*", { count: "exact", head: true })

    if (error) {
      console.error("Database Error:", error)
      return 0
    }
    return count || 0
  } catch (error) {
    console.error("Failed to fetch total military personnel:", error)
    return 0
  }
}

// Fetch Current Day Attendance
export async function fetchCurrentDayAttendance() {
  noStore()
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await (supabase as any)
      .from("military_attendance_records")
      .select("*")
      .eq("date", today)

    if (error) {
      console.error("Database Error:", error)
      return { present: 0, absent: 0, justified: 0, percentage: 0 }
    }

    const records = data || []
    const present = records.filter((r: any) => r.status === 'presente').length
    const absent = records.filter((r: any) => r.status === 'ausente').length
    const justified = records.filter((r: any) => r.is_justified).length
    const total = records.length
    const percentage = total > 0 ? Math.round((present / total) * 100) : 0

    return { present, absent, justified, percentage }
  } catch (error) {
    console.error("Failed to fetch current day attendance:", error)
    return { present: 0, absent: 0, justified: 0, percentage: 0 }
  }
}

// Fetch Monthly Attendance Stats (starting from tomorrow)
export async function fetchMonthlyAttendanceStats() {
  noStore()
  try {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const startDate = tomorrow.toISOString().split('T')[0]
    
    const { data, error } = await (supabase as any)
      .from("military_attendance_records")
      .select("*")
      .gte("date", startDate)

    if (error) {
      console.error("Database Error:", error)
      return []
    }

    // Group by month and calculate stats
    const monthlyData = data?.reduce((acc: any, record: any) => {
      const month = new Date(record.date).toLocaleDateString('pt-BR', { month: 'short' })
      if (!acc[month]) {
        acc[month] = { present: 0, absent: 0, total: 0 }
      }
      acc[month].total++
      if (record.status === 'presente') acc[month].present++
      if (record.status === 'ausente') acc[month].absent++
      return acc
    }, {} as Record<string, { present: number, absent: number, total: number }>)

    return Object.entries(monthlyData || {}).map(([month, stats]) => {
      const typedStats = stats as { present: number, absent: number, total: number }
      return {
        month,
        present: typedStats.present,
        absent: typedStats.absent,
        percentage: typedStats.total > 0 ? Math.round((typedStats.present / typedStats.total) * 100) : 0
      }
    })
  } catch (error) {
    console.error("Failed to fetch monthly attendance stats:", error)
    return []
  }
}

// Fetch Justification Types
export async function fetchJustificationTypes() {
  noStore()
  try {
    const { data, error } = await supabase
      .from("military_justifications")
      .select("reason")

    if (error) {
      console.error("Database Error:", error)
      return []
    }

    // Count by reason type
    const reasonCounts = data?.reduce((acc: any, justification: any) => {
      const reason = justification.reason
      acc[reason] = (acc[reason] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const total = (Object.values(reasonCounts || {}) as number[]).reduce((sum: number, count: number) => sum + count, 0)

    return Object.entries(reasonCounts || {}).map(([type, count]) => ({
      type,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0
    })).sort((a, b) => b.count - a.count)
  } catch (error) {
    console.error("Failed to fetch justification types:", error)
    return []
  }
}

// Fetch Most Used Keys from Claviculario Movements with JOIN (like history page)
export async function fetchMostUsedKeys() {
  noStore()
  try {
    // Usar o mesmo JOIN que a página de histórico usa
    const { data, error } = await supabase
      .from("claviculario_movements")
      .select(`
        key_id,
        type,
        timestamp,
        claviculario_keys (
          key_name,
          location
        )
      `)
      .eq("type", "withdrawal")
      .order("timestamp", { ascending: false })

    if (error) {
      console.error("Database Error:", error)
      return []
    }

    if (!data || data.length === 0) {
      console.log("Nenhum dado de chaves encontrado")
      return []
    }

    // Count usage by key_id and get key details
    const keyUsage = data.reduce((acc, record) => {
      const keyId = record.key_id
      const clavicularioKey = Array.isArray(record.claviculario_keys) ? record.claviculario_keys[0] : record.claviculario_keys
      const keyName = clavicularioKey?.key_name || `Chave ${keyId.slice(0, 8)}`
      const location = clavicularioKey?.location || "Local não especificado"
      
      if (!acc[keyId]) {
        acc[keyId] = { 
          usageCount: 0, 
          lastUsed: record.timestamp,
          keyName: keyName,
          location: location
        }
      }
      acc[keyId].usageCount++
      if (new Date(record.timestamp) > new Date(acc[keyId].lastUsed)) {
        acc[keyId].lastUsed = record.timestamp
      }
      return acc
    }, {} as Record<string, { 
      usageCount: number, 
      lastUsed: string,
      keyName: string,
      location: string
    }>)

    return Object.entries(keyUsage).map(([keyId, data]) => ({
      keyName: data.keyName,
      location: data.location,
      usageCount: data.usageCount,
      lastUsed: new Date(data.lastUsed).toLocaleDateString('pt-BR')
    })).sort((a, b) => b.usageCount - a.usageCount).slice(0, 5)
  } catch (error) {
    console.error("Failed to fetch most used keys:", error)
    return []
  }
}

// Fetch Upcoming Events (including BDS)
export async function fetchUpcomingEvents() {
  noStore()
  try {
    const today = new Date().toISOString().split('T')[0]
    
    const { data, error } = await supabase
      .from("military_events")
      .select("*")
      .gte("date", today)
      .order("date", { ascending: true })
      .limit(5)

    if (error) {
      console.error("Database Error:", error)
      return []
    }

    return (data || []).map(event => ({
      title: event.title,
      date: new Date(event.date).toLocaleDateString('pt-BR'),
      type: event.description || 'Evento'
    }))
  } catch (error) {
    console.error("Failed to fetch upcoming events:", error)
    return []
  }
}
