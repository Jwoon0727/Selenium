"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import DongEntryRow from "@/components/apart/DongEntryRow"
import { parseDongEntries } from "@/lib/apartExcel"
import type { DongEntry } from "@/lib/apartStorage"

interface DongEntryStackProps {
  entries: DongEntry[]
  maxEntries: number
  onDongNameChange: (id: string, value: string) => void
  onJsonTextChange: (id: string, value: string) => void
  onRemove: (id: string) => void
  onAdd: () => void
}

export default function DongEntryStack({
  entries,
  maxEntries,
  onDongNameChange,
  onJsonTextChange,
  onRemove,
  onAdd,
}: DongEntryStackProps) {
  const totalUnits = parseDongEntries(entries).valid.reduce((sum, entry) => sum + entry.units.length, 0)
  const isMaxReached = entries.length >= maxEntries

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {entries.length} / {maxEntries}개 동 · 총 {totalUnits}개 호수
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAdd}
          disabled={isMaxReached}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          동 추가
        </Button>
      </div>

      {entries.length === 0 ? (
        <p className="text-center text-gray-500 py-4">
          추가된 동이 없습니다. 위 동 추가 버튼을 눌러 시작하세요.
        </p>
      ) : (
        <div className="space-y-4">
          {entries.map((entry, index) => (
            <DongEntryRow
              key={entry.id}
              entry={entry}
              index={index}
              onDongNameChange={onDongNameChange}
              onJsonTextChange={onJsonTextChange}
              onRemove={onRemove}
            />
          ))}
        </div>
      )}
    </div>
  )
}
