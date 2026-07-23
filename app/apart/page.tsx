"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/app/hooks/use-toast"
import ApartMetaForm from "@/components/apart/ApartMetaForm"
import DongEntryStack from "@/components/apart/DongEntryStack"
import {
  clearApartDraft,
  emptyApartDraft,
  loadApartDraft,
  saveApartDraft,
  type ApartDraft,
  type DongEntry,
} from "@/lib/apartStorage"
import { downloadApartExcel, parseDongEntries, type ParsedDongEntry } from "@/lib/apartExcel"

const MAX_DONG_ENTRIES = 10

function createEntryId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export default function ApartPage() {
  const [draft, setDraft] = useState<ApartDraft>(emptyApartDraft)
  const [isLoaded, setIsLoaded] = useState(false)
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false)
  const [fileName, setFileName] = useState("")
  const [pendingExport, setPendingExport] = useState<ParsedDongEntry[]>([])

  // 초안 복원
  useEffect(() => {
    setDraft(loadApartDraft())
    setIsLoaded(true)
  }, [])

  // 변경 시마다 자동 저장
  useEffect(() => {
    if (!isLoaded) return
    saveApartDraft(draft)
  }, [draft, isLoaded])

  const isMaxReached = draft.dongEntries.length >= MAX_DONG_ENTRIES

  const handleAddDong = () => {
    if (isMaxReached) {
      toast({
        title: "최대 개수 초과",
        description: `동은 최대 ${MAX_DONG_ENTRIES}개까지 입력할 수 있습니다.`,
        variant: "destructive",
      })
      return
    }

    const newEntry: DongEntry = { id: createEntryId(), dongName: "", jsonText: "" }
    setDraft((prev) => ({ ...prev, dongEntries: [...prev.dongEntries, newEntry] }))
  }

  const handleDongNameChange = (id: string, value: string) => {
    setDraft((prev) => ({
      ...prev,
      dongEntries: prev.dongEntries.map((entry) =>
        entry.id === id ? { ...entry, dongName: value } : entry
      ),
    }))
  }

  const handleJsonTextChange = (id: string, value: string) => {
    setDraft((prev) => ({
      ...prev,
      dongEntries: prev.dongEntries.map((entry) =>
        entry.id === id ? { ...entry, jsonText: value } : entry
      ),
    }))
  }

  const handleRemoveDong = (id: string) => {
    setDraft((prev) => ({
      ...prev,
      dongEntries: prev.dongEntries.filter((entry) => entry.id !== id),
    }))
  }

  const handleOpenDownloadDialog = () => {
    if (!draft.apartName.trim()) {
      toast({
        title: "아파트명 필요",
        description: "아파트명을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    const { valid, errors } = parseDongEntries(draft.dongEntries)

    if (errors.length > 0) {
      toast({
        title: "동 입력 확인 필요",
        description: errors.map((e) => `${e.dongName}: ${e.message}`).join(" / "),
        variant: "destructive",
      })
      return
    }

    if (valid.length === 0) {
      toast({
        title: "동 데이터 필요",
        description: "최소 1개 이상의 동을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    setPendingExport(valid)
    setFileName(draft.apartName.trim())
    setIsDownloadDialogOpen(true)
  }

  const handleDownload = async () => {
    if (!fileName.trim()) {
      toast({
        title: "파일명 필요",
        description: "파일명을 입력해주세요.",
        variant: "destructive",
      })
      return
    }

    const result = await downloadApartExcel(
      { apartName: draft.apartName.trim(), roadName: draft.roadName, lotNumber: draft.lotNumber },
      pendingExport,
      fileName.trim()
    )

    setIsDownloadDialogOpen(false)
    toast({
      title: "엑셀 다운로드 완료",
      description: `${result.fileName} · ${result.rowCount}개 행이 저장되었습니다.`,
    })
  }

  const handleReset = () => {
    setDraft(emptyApartDraft)
    clearApartDraft()
    toast({
      title: "초기화 완료",
      description: "입력한 데이터가 모두 삭제되었습니다.",
    })
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild aria-label="대시보드로 돌아가기">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">아파트 데이터 입력</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset}>
            초기화
          </Button>
          <Button onClick={handleOpenDownloadDialog} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            출력하기
          </Button>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">단지 공통 정보</h2>
        <ApartMetaForm
          apartName={draft.apartName}
          roadName={draft.roadName}
          lotNumber={draft.lotNumber}
          onApartNameChange={(value) => setDraft((prev) => ({ ...prev, apartName: value }))}
          onRoadNameChange={(value) => setDraft((prev) => ({ ...prev, roadName: value }))}
          onLotNumberChange={(value) => setDraft((prev) => ({ ...prev, lotNumber: value }))}
        />
      </Card>

      <Card className="p-6 space-y-4">
        <h2 className="text-lg font-semibold">동 일괄 입력</h2>
        <DongEntryStack
          entries={draft.dongEntries}
          maxEntries={MAX_DONG_ENTRIES}
          onDongNameChange={handleDongNameChange}
          onJsonTextChange={handleJsonTextChange}
          onRemove={handleRemoveDong}
          onAdd={handleAddDong}
        />
      </Card>

      {/* Download Dialog */}
      <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>엑셀 파일 다운로드</DialogTitle>
            <DialogDescription>저장할 파일의 이름을 입력해주세요.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="apart-file-name">파일명</Label>
              <Input
                id="apart-file-name"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="파일명을 입력하세요"
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsDownloadDialogOpen(false)}
            >
              취소
            </Button>
            <Button type="button" onClick={handleDownload}>
              다운로드
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
