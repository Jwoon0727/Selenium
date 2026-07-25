"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Maximize2, Minimize2, RefreshCw, Share2, Download, Building2 } from "lucide-react"

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
  forbidden?: string;
  memo?: string;
}

interface DownloadHistory {
  fileName: string;
  downloadDate: string;
  addressCount: number;
}

interface WebkitElement extends HTMLDivElement {
  webkitRequestFullscreen: () => Promise<void>;
}

interface WebkitDocument extends Document {
  webkitExitFullscreen: () => Promise<void>;
}

export default function DashboardPage() {

  const [isFullScreen, setIsFullScreen] = useState(false)

  const [shareUrl] = useState("")
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isDownloadDialogOpen, setIsDownloadDialogOpen] = useState(false)
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false)
  const [fileName, setFileName] = useState("")
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistory[]>([])
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const shareInputRef = useRef<HTMLInputElement>(null)
  const [addresses, setAddresses] = useState<Address[]>([])

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      if (mapContainerRef.current?.requestFullscreen) {
        mapContainerRef.current.requestFullscreen();
      } else if ((mapContainerRef.current as WebkitElement)?.webkitRequestFullscreen) {
        (mapContainerRef.current as WebkitElement).webkitRequestFullscreen();
      } else {
        setIsFullScreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as WebkitDocument).webkitExitFullscreen) {
        (document as WebkitDocument).webkitExitFullscreen();
      } else {
        setIsFullScreen(false);
      }
    }
  };

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

  const handleAddressesUpdate = (updatedAddresses: Address[]) => {
    setAddresses(updatedAddresses);
  };

  // 다운로드 기록 로드
  useEffect(() => {
    const savedHistory = localStorage.getItem('downloadHistory');
    if (savedHistory) {
      setDownloadHistory(JSON.parse(savedHistory));
    }
  }, []);

  // 다운로드 기록 저장
  const saveToHistory = (fileName: string, addressCount: number) => {
    const newHistory: DownloadHistory = {
      fileName,
      downloadDate: new Date().toLocaleString(),
      addressCount
    };
    
    const updatedHistory = [newHistory, ...downloadHistory].slice(0, 10); // 최근 10개만 유지
    setDownloadHistory(updatedHistory);
    localStorage.setItem('downloadHistory', JSON.stringify(updatedHistory));
  };

  const handleDownload = () => {
    if (!fileName.trim()) {
      toast({
        title: "파일명 필요",
        description: "파일명을 입력해주세요.",
        variant: "destructive"
      });
      return;
    }

    import('xlsx').then(XLSX => {
      const formattedData = addresses.map(addr => {
        const addressParts = addr.address.split(' ');
        const roadName = addressParts.find(part => part.includes('로') || part.includes('길')) || '';
        const buildingNumber = addressParts.find(part => /^\d+(-\d+)?$/.test(part)) || '';

        return {
          '도로명': roadName,
          '번지': buildingNumber,
          '건물명': addr.name,
          '세부주소': addr.address,
          '금지': addr.forbidden || '',
          '메모': addr.memo || ''
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(formattedData, {
        header: ['도로명', '번지', '건물명', '세부주소', '금지', '메모']
      });

      const columnWidths = [
        { wch: 15 },
        { wch: 8 },
        { wch: 20 },
        { wch: 30 },
        { wch: 8 },
        { wch: 20 }
      ];
      worksheet['!cols'] = columnWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "주소목록");
      
      const finalFileName = fileName.endsWith('.xlsx') ? fileName : `${fileName}.xlsx`;
      XLSX.writeFile(workbook, finalFileName);
      
      // 다운로드 기록 저장
      saveToHistory(finalFileName, addresses.length);
      
      setIsDownloadDialogOpen(false);
      setFileName("");
      
      toast({
        title: "엑셀 다운로드 완료",
        description: "주소 데이터가 엑셀 파일로 저장되었습니다.",
      });
    });
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullScreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullScreenChange);

    // 저장된 데이터 불러오기


    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullScreenChange);
    };
  }, []);

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">SELENIUM</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            asChild
            className="flex items-center gap-2"
          >
            <Link href="/apart">
              <Building2 className="h-4 w-4" />
              아파트 입력
            </Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsHistoryDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"/>
            </svg>
            다운로드 기록123
          </Button>
          <Button
            variant="outline"
            onClick={() => setIsShareDialogOpen(true)}
            className="flex items-center gap-2"
          >
            <Share2 className="h-4 w-4" />
            공유하기
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const today = new Date();
              const dateStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
              setFileName(`주소목록_${dateStr}`);
              setIsDownloadDialogOpen(true);
            }}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            엑셀 다운로드
          </Button>
        </div>
      </div>

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
        
            {/* 버튼 그룹 */}
            <div className="absolute top-2 right-2 z-10 flex gap-2">
              {/* 새로고침 버튼 */}
              <Button
                variant="outline"
                size="icon"
                className="bg-white/80 hover:bg-white"
                onClick={() => window.location.reload()}
                aria-label="새로고침"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>

              {/* 전체화면 버튼 */}
              <Button
                variant="outline"
                size="icon"
                className="bg-white/80 hover:bg-white"
                onClick={toggleFullScreen}
                aria-label={isFullScreen ? "전체화면 종료" : "전체화면으로 보기"}
              >
                {isFullScreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </Card>
        </div>
      </div>
      <div className="w-full h-full">
        <AddressTable 
          addresses={addresses} 
          onAddressesUpdate={handleAddressesUpdate}
        />
      </div>
      {/* 다운로드 기록 섹션 */}
      <Card className="p-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">다운로드 기록</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setDownloadHistory([]);
              localStorage.removeItem('downloadHistory');
              toast({
                title: "기록 삭제 완료",
                description: "모든 다운로드 기록이 삭제되었습니다.",
              });
            }}
          >
            기록 삭제
          </Button>
        </div>
        <div className="space-y-2">
          {downloadHistory.length > 0 ? (
            downloadHistory.map((history, index) => (
              <div
                key={index}
                className="p-3 bg-gray-50 rounded-lg flex justify-between items-center hover:bg-gray-100 transition-colors"
              >
                <div className="space-y-1">
                  <p className="font-medium">{history.fileName}</p>
                  <p className="text-sm text-gray-500">
                    {history.downloadDate} · {history.addressCount}개 주소
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFileName(history.fileName.replace('.xlsx', ''));
                    setIsDownloadDialogOpen(true);
                  }}
                >
                  다시 다운로드
                </Button>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">다운로드 기록이 없습니다.</p>
          )}
        </div>
      </Card>

    
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
      {/* Download Dialog */}
      <Dialog open={isDownloadDialogOpen} onOpenChange={setIsDownloadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>엑셀 파일 다운로드</DialogTitle>
            <DialogDescription>저장할 파일의 이름을 입력해주세요.</DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="file-name">파일명</Label>
              <Input
                id="file-name"
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
            <Button
              type="button"
              onClick={handleDownload}
            >
              다운로드
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Download History Dialog */}
      <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>다운로드 기록</DialogTitle>
            <DialogDescription>최근 다운로드한 파일 목록입니다.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[400px] overflow-auto">
            {downloadHistory.length > 0 ? (
              <div className="space-y-2">
                {downloadHistory.map((history, index) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-50 rounded-lg flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <p className="font-medium">{history.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {history.downloadDate} · {history.addressCount}개 주소
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">다운로드 기록이 없습니다.</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsHistoryDialogOpen(false)}
            >
              닫기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

