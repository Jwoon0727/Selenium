export interface DongEntry {
  id: string
  dongName: string
  jsonText: string
}

export interface ApartDraft {
  apartName: string
  roadName: string
  lotNumber: string
  dongEntries: DongEntry[]
}

const STORAGE_KEY = "apart:draft"

export const emptyApartDraft: ApartDraft = {
  apartName: "",
  roadName: "",
  lotNumber: "",
  dongEntries: [],
}

function createEntryId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

// 이전 버전(units: string[] 기반) 저장 데이터도 안전하게 복원하기 위한 변환
function toDongEntry(raw: unknown): DongEntry {
  if (typeof raw !== "object" || raw === null) {
    return { id: createEntryId(), dongName: "", jsonText: "" }
  }

  const record = raw as Record<string, unknown>
  const id = typeof record.id === "string" ? record.id : createEntryId()
  const dongName = typeof record.dongName === "string" ? record.dongName : ""

  if (typeof record.jsonText === "string") {
    return { id, dongName, jsonText: record.jsonText }
  }

  // 구버전 호환: units 배열만 있던 데이터를 jsonText 문자열로 변환
  if (Array.isArray(record.units)) {
    return { id, dongName, jsonText: JSON.stringify(record.units) }
  }

  return { id, dongName, jsonText: "" }
}

export function loadApartDraft(): ApartDraft {
  if (typeof window === "undefined") return emptyApartDraft

  const saved = localStorage.getItem(STORAGE_KEY)
  if (!saved) return emptyApartDraft

  try {
    const parsed = JSON.parse(saved)
    const rawEntries = Array.isArray(parsed?.dongEntries) ? parsed.dongEntries : []

    return {
      apartName: typeof parsed?.apartName === "string" ? parsed.apartName : "",
      roadName: typeof parsed?.roadName === "string" ? parsed.roadName : "",
      lotNumber: typeof parsed?.lotNumber === "string" ? parsed.lotNumber : "",
      dongEntries: rawEntries.map(toDongEntry),
    }
  } catch {
    return emptyApartDraft
  }
}

export function saveApartDraft(draft: ApartDraft) {
  if (typeof window === "undefined") return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(draft))
}

export function clearApartDraft() {
  if (typeof window === "undefined") return
  localStorage.removeItem(STORAGE_KEY)
}
