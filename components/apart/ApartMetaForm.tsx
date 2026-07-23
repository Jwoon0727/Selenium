"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ApartMetaFormProps {
  apartName: string
  roadName: string
  lotNumber: string
  onApartNameChange: (value: string) => void
  onRoadNameChange: (value: string) => void
  onLotNumberChange: (value: string) => void
}

export default function ApartMetaForm({
  apartName,
  roadName,
  lotNumber,
  onApartNameChange,
  onRoadNameChange,
  onLotNumberChange,
}: ApartMetaFormProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <div className="space-y-1.5">
        <Label htmlFor="apart-name">아파트명</Label>
        <Input
          id="apart-name"
          value={apartName}
          onChange={(e) => onApartNameChange(e.target.value)}
          placeholder="예: 백석푸르지오"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="road-name">도로명</Label>
        <Input
          id="road-name"
          value={roadName}
          onChange={(e) => onRoadNameChange(e.target.value)}
          placeholder="예: 고봉로"
        />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="lot-number">번지</Label>
        <Input
          id="lot-number"
          value={lotNumber}
          onChange={(e) => onLotNumberChange(e.target.value)}
          placeholder="예: 725"
        />
      </div>
    </div>
  )
}
