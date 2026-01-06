import { supabase } from "./supabase"
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

// Fetch Military Personnel (Read-only)
export async function fetchMilitaryPersonnel(): Promise<MilitaryPersonnel[]> {
  try {
    const { data, error } = await supabase
      .from("military_personnel")
      .select("*")
      .order("name", { ascending: true })

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

// Fetch Daily Permanence Records (Read-only)
export async function fetchDailyPermanenceRecords(): Promise<DailyPermanenceRecord[]> {
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

// Fetch Military Attendance Records (Read-only)
export async function fetchMilitaryAttendanceRecords(): Promise<MilitaryAttendanceRecord[]> {
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

// Fetch Military Justifications (Read-only)
export async function fetchMilitaryJustifications(): Promise<MilitaryJustification[]> {
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

// Fetch Claviculario Keys (Read-only)
export async function fetchClavicularioKeys(): Promise<ClavicularioKey[]> {
  try {
    const { data, error } = await supabase
      .from("claviculario_keys")
      .select("*")
      .order("key_name", { ascending: true })

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

// Fetch Claviculario History (Read-only)
export async function fetchClavicularioHistory(): Promise<ClavicularioHistory[]> {
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

// Fetch Events (Read-only)
export async function fetchEvents(): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .order("start_time", { ascending: true })

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

// Fetch Flights (Read-only)
export async function fetchFlights(): Promise<Flight[]> {
  try {
    const { data, error } = await supabase
      .from("flights")
      .select("*")
      .order("departure_time", { ascending: false })

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

// Fetch Personal Notes (Read-only)
export async function fetchPersonalNotes(): Promise<PersonalNote[]> {
  try {
    const { data, error } = await supabase
      .from("personal_notes")
      .select("*")
      .order("created_at", { ascending: false })

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

// Fetch Military Personal Checklist Templates (Read-only)
export async function fetchMilitaryPersonalChecklistTemplates(): Promise<MilitaryPersonalChecklistTemplate[]> {
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

// Fetch Military Personal Checklists (Read-only)
export async function fetchMilitaryPersonalChecklists(): Promise<MilitaryPersonalChecklist[]> {
  try {
    const { data, error } = await supabase
      .from("military_personal_checklists")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Database Error:", error)
      throw new Error("Failed to fetch personal checklists.")
    }
    return data as MilitaryPersonalChecklist[]
  } catch (error) {
    console.error("Failed to fetch personal checklists:", error)
    throw new Error("Failed to fetch personal checklists.")
  }
}
