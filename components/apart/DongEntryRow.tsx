"use client"

import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { DongEntry } from "@/lib/apartStorage"

interface DongEntryRowProps {
  entry: DongEntry
  index: number
  onDongNameChange: (id: string, value: string) => void
  onJsonTextChange: (id: string, value: string) => void
  onRemove: (id: string) => void
}

export default function DongEntryRow({
  entry,
  index,
  onDongNameChange,
  onJsonTextChange,
  onRemove,
}: DongEntryRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr_40px] gap-3 items-start border-b pb-4 last:border-b-0 last:pb-0">
      <div className="space-y-1.5">
        <Label htmlFor={`dong-name-${entry.id}`}>{index + 1}번째 동</Label>
        <Input
          id={`dong-name-${entry.id}`}
          value={entry.dongName}
          onChange={(e) => onDongNameChange(entry.id, e.target.value)}
          placeholder="예: 101 또는 101동"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor={`dong-json-${entry.id}`}>호수 JSON (평면 배열)</Label>
        <textarea
          id={`dong-json-${entry.id}`}
          value={entry.jsonText}
          onChange={(e) => onJsonTextChange(entry.id, e.target.value)}
          placeholder='["2101","2102","2001", ...]'
          rows={3}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm font-mono shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <div className="flex sm:justify-center sm:pt-7">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onRemove(entry.id)}
          aria-label={`${index + 1}번째 동 삭제`}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
