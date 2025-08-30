import { createClient } from "@supabase/supabase-js"
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

// Initialize Supabase client
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

// Fetch Military Personnel
export async function fetchMilitaryPersonnel(): Promise<MilitaryPersonnel[]> {
  noStore()
  try {
    const { data, error } = await supabase.from("military_personnel").select("*").order("name", { ascending: true })

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
    const { data, error } = await supabase
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
    const { data, error } = await supabase.from("claviculario_keys").select("*").order("key_name", { ascending: true })

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
    const { data, error } = await supabase.from("events").select("*").order("start_time", { ascending: true })

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
    const { data, error } = await supabase.from("flights").select("*").order("departure_time", { ascending: false })

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
    const { data, error } = await supabase.from("personal_notes").select("*").order("created_at", { ascending: false })

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
