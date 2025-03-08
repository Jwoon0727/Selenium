"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Maximize2, Minimize2 } from "lucide-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/app/hooks/use-toast"
import AddressTable from '@/components/AddressTable';
import KakaoMap from '@/components/KakaoMap'



interface Address {
  id: number;
  name: string;
  address: string;
  phone: string;
  category: string;
  rating: string;
}

export default function DashboardPage() {

  const [isFullScreen, setIsFullScreen] = useState(false)

  const [shareUrl] = useState("")
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const shareInputRef = useRef<HTMLInputElement>(null)
  const [addresses, setAddresses] = useState<Address[]>([])

 

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  }






  const copyShareUrl = () => {
    if (shareInputRef.current) {
      shareInputRef.current.select()
      document.execCommand("copy")
      toast({
        title: "URL 복사됨",
        description: "공유 링크가 클립보드에 복사되었습니다.",
      })
      setIsShareDialogOpen(false)
    }
  }

  const handleAddressesFound = (newAddresses: Address[]) => {
    if (JSON.stringify(addresses) !== JSON.stringify(newAddresses)) {
      requestAnimationFrame(() => {
        setAddresses(newAddresses);
      });
    }
  }

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement)
    }

    document.addEventListener("fullscreenchange", handleFullScreenChange)

    // 저장된 데이터 불러오기


    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange)
    }
  }, [])

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">대시보드</h1>

      

      <div className="grid grid-cols-1 gap-6">
        {/* Map Component */}
        <div className="relative">
          <Card
            ref={mapContainerRef}
            className={`w-full ${
              isFullScreen 
                ? "fixed inset-0 z-50 h-screen" 
                : "h-[400px]"
            } relative overflow-hidden`}
          >
            <div className="absolute inset-0">
              <KakaoMap 
                enableDrawingTools={true} 
                onAddressesFound={handleAddressesFound} 
              />
            </div>
        
            {/* Full Screen Toggle Button */}
            <Button
              variant="outline"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-white/80 hover:bg-white"
              onClick={toggleFullScreen}
              aria-label={isFullScreen ? "전체화면 종료" : "전체화면으로 보기"}
            >
              {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </Card>
        </div>
      </div>
      <div className="w-full h-full">
        <AddressTable addresses={addresses} />
      </div>
      {/* Share Dialog */}
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>데이터 공유</DialogTitle>
            <DialogDescription>아래 링크를 복사하여 다른 사람과 공유하세요.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="share-link" className="sr-only">
                공유 링크
              </Label>
              <Input id="share-link" ref={shareInputRef} value={shareUrl} readOnly />
            </div>
            <Button type="submit" size="sm" className="px-3" onClick={copyShareUrl}>
              <span className="sr-only">복사</span>
              복사
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogTrigger asChild>
              <Button type="button" variant="secondary" onClick={() => setIsShareDialogOpen(false)}>
                닫기
              </Button>
            </DialogTrigger>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

