export type MilitaryPersonnel = {
  id: string
  clerk_user_id?: string
  name: string
  rank: string
  squadron?: string
  role: "military" | "admin"
  email?: string
  phone_number?: string
  created_at: string
  updated_at: string
}

export type CallType = {
  id: string
  label: string
}

export type AbsenceReason = {
  id: string
  label: string
}

export type DailyPermanenceRecord = {
  id: string
  military_id: string
  military_name: string
  rank: string
  date: string
  status: string
  details?: string
  created_at: string
  updated_at: string
}

export type MilitaryAttendanceRecord = {
  id: string
  military_id: string
  military_name: string
  rank: string
  call_type: string
  date: string
  status: string
  justification?: string
  created_at: string
  updated_at: string
}

export type MilitaryJustification = {
  id: string
  military_id: string
  military_name: string
  type: string
  reason: string
  start_date: string
  end_date: string
  approved: boolean
  approved_by?: string
  created_at: string
  updated_at: string
}

export type ClavicularioKey = {
  id: string
  key_name: string
  location?: string
  status: "Disponível" | "Em Uso" | "Manutenção" | "Perdida"
  last_checked_out_by?: string
  last_checked_out_at?: string
  last_checked_in_at?: string
  created_at: string
  updated_at: string
}

export type ClavicularioHistory = {
  id: string
  key_id: string
  military_id: string
  military_name: string
  action: "Retirada" | "Devolvida"
  action_at: string
  notes?: string
}

export type Event = {
  id: string
  title: string
  description?: string
  start_time: string
  end_time: string
  location?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export type Flight = {
  id: string
  flight_number: string
  aircraft_type?: string
  departure_time: string
  arrival_time: string
  origin: string
  destination: string
  pilot_id?: string
  copilot_id?: string
  status: "Scheduled" | "Departed" | "Arrived" | "Cancelled" | "Delayed"
  notes?: string
  created_at: string
  updated_at: string
}

export type PersonalNote = {
  id: string
  military_id: string
  title: string
  content: string
  created_at: string
  updated_at: string
}

export type MilitaryPersonalChecklistTemplate = {
  id: string
  template_name: string
  description?: string
  created_at: string
  updated_at: string
}

export type ChecklistTemplateItem = {
  id: string
  template_id: string
  item_description: string
  item_order: number
  created_at: string
  updated_at: string
}

export type MilitaryPersonalChecklist = {
  id: string
  military_id: string
  template_id: string
  checklist_date: string
  status: "Pending" | "Completed" | "In Progress"
  created_at: string
  updated_at: string
}

export type ChecklistItemStatus = {
  id: string
  checklist_id: string
  template_item_id: string
  is_completed: boolean
  completed_at?: string
  notes?: string
  created_at: string
  updated_at: string
}
