import type { DongEntry } from "@/lib/apartStorage"

const EXCEL_HEADER = ['도로명', '번지', '건물명', '세부주소', '금지', '메모'] as const

const EXCEL_COLUMN_WIDTHS = [
  { wch: 15 },
  { wch: 8 },
  { wch: 20 },
  { wch: 30 },
  { wch: 8 },
  { wch: 20 },
]

export interface ApartExcelRow {
  '도로명': string
  '번지': string
  '건물명': string
  '세부주소': string
  '금지': string
  '메모': string
}

export interface ApartMeta {
  apartName: string
  roadName: string
  lotNumber: string
}

export interface ParsedDongEntry {
  dongName: string
  units: string[]
}

export interface DongParseError {
  index: number
  dongName: string
  message: string
}

export interface DongParseResult {
  valid: ParsedDongEntry[]
  errors: DongParseError[]
}

// "101" -> "101동", "101동" -> "101동" (그대로)
export function normalizeDongName(dongName: string): string {
  const trimmed = dongName.trim()
  if (!trimmed) return trimmed
  return trimmed.endsWith("동") ? trimmed : `${trimmed}동`
}

// 행별 raw 입력(동 이름 + JSON 텍스트)을 파싱/검증. 출력 시점에 호출.
export function parseDongEntries(entries: DongEntry[]): DongParseResult {
  const valid: ParsedDongEntry[] = []
  const errors: DongParseError[] = []

  entries.forEach((entry, index) => {
    const dongName = entry.dongName.trim()
    const jsonText = entry.jsonText.trim()
    const label = dongName || `${index + 1}번째 행`

    // 완전히 빈 행은 무시
    if (!dongName && !jsonText) return

    if (!dongName) {
      errors.push({ index, dongName: label, message: "동 이름이 비어 있습니다." })
      return
    }

    if (!jsonText) {
      errors.push({ index, dongName: label, message: "호수 JSON이 비어 있습니다." })
      return
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(jsonText)
    } catch {
      errors.push({ index, dongName: label, message: "JSON 파싱에 실패했습니다." })
      return
    }

    if (!Array.isArray(parsed) || !parsed.every((item) => typeof item === "string")) {
      errors.push({
        index,
        dongName: label,
        message: '호수 문자열 배열 형태가 아닙니다. 예: ["101","102"]',
      })
      return
    }

    if (parsed.length === 0) {
      errors.push({ index, dongName: label, message: "호수가 1개 이상 필요합니다." })
      return
    }

    valid.push({ dongName, units: parsed })
  })

  return { valid, errors }
}

// 호수 문자열을 층(floor)과 라인(line, 마지막 2자리)으로 분해.
// 예: "101" -> { line: 1, floor: 1 }, "1502" -> { line: 2, floor: 15 }, "2101" -> { line: 1, floor: 21 }
function splitUnit(unit: string): { line: number; floor: number } | null {
  const trimmed = unit.trim()
  if (!/^\d+$/.test(trimmed) || trimmed.length < 3) return null
  const line = Number(trimmed.slice(-2))
  const floor = Number(trimmed.slice(0, -2))
  return { line, floor }
}

// 라인(호)별로 묶어 정렬: 먼저 라인 오름차순, 같은 라인 내에서는 층 오름차순.
// 예: 101, 201, 301, ... (1호 라인) -> 102, 202, 302, ... (2호 라인)
// 표준 형식이 아니면 숫자/문자열 비교로 대체.
function compareUnits(a: string, b: string): number {
  const pa = splitUnit(a)
  const pb = splitUnit(b)
  if (pa && pb) {
    if (pa.line !== pb.line) return pa.line - pb.line
    return pa.floor - pb.floor
  }

  const numA = Number(a)
  const numB = Number(b)
  if (a.trim() !== "" && b.trim() !== "" && Number.isFinite(numA) && Number.isFinite(numB)) {
    return numA - numB
  }
  return a.localeCompare(b)
}

// 호수 목록에서 라인(호) 범위를 텍스트로 만든다.
// 예: 1·2호 라인 -> "1-2라인", 1·2·3호 라인 -> "1-3라인", 1호 라인만 -> "1라인"
export function buildLineLabel(units: string[]): string {
  const lines = units
    .map((unit) => splitUnit(unit)?.line)
    .filter((line): line is number => line !== undefined && line !== null)

  if (lines.length === 0) return ""

  const min = Math.min(...lines)
  const max = Math.max(...lines)
  return min === max ? `${min}라인` : `${min}-${max}라인`
}

// 각 동의 첫 번째 호수 행에만 도로명·번지·건물명을 표시하고, 같은 동의 나머지 행은 공란으로 둔다.
export function buildApartExcelRows(meta: ApartMeta, dongEntries: ParsedDongEntry[]): ApartExcelRow[] {
  const rows: ApartExcelRow[] = []

  for (const entry of dongEntries) {
    const dong = normalizeDongName(entry.dongName)
    const lineLabel = buildLineLabel(entry.units)
    const buildingName = [`${meta.apartName} ${dong}`.trim(), lineLabel]
      .filter(Boolean)
      .join(" ")
    const sortedUnits = [...entry.units].sort(compareUnits)

    sortedUnits.forEach((unit, unitIndex) => {
      rows.push({
        '도로명': unitIndex === 0 ? meta.roadName : '',
        '번지': unitIndex === 0 ? meta.lotNumber : '',
        '건물명': unitIndex === 0 ? buildingName : '',
        '세부주소': unit,
        '금지': '',
        '메모': '',
      })
    })
  }

  return rows
}

export async function downloadApartExcel(
  meta: ApartMeta,
  dongEntries: ParsedDongEntry[],
  fileName: string
) {
  const XLSX = await import('xlsx')
  const rows = buildApartExcelRows(meta, dongEntries)

  const worksheet = XLSX.utils.json_to_sheet(rows, {
    header: [...EXCEL_HEADER],
  })
  worksheet['!cols'] = EXCEL_COLUMN_WIDTHS

  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, "주소목록")

  const finalFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`
  XLSX.writeFile(workbook, finalFileName)

  return { fileName: finalFileName, rowCount: rows.length }
}
