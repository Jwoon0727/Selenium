"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "@/app/hooks/use-toast" 


export default function LoginPage() {
  const [pin, setPin] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (pin === "7327") {
      sessionStorage.setItem('isLoggedIn', 'true')
      router.push("/dashboard")
    } else {
      alert("비밀번호가 일치하지 않습니다.")
      toast({
        title: "로그인 실패",
        description: "올바른 PIN 번호를 입력해주세요.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="mx-auto max-w-sm space-y-6 p-4">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">PIN 로그인</h1>
          <p className="text-gray-500">PIN 번호를 입력하여 로그인하세요</p>
          <p className="text-sm text-red-500 mt-2">※ 본 서비스는 PC에서만 이용 가능합니다</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="password"
            placeholder="PIN 번호 입력"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={4}
            className="text-center text-2xl tracking-widest"
          />
          <Button type="submit" className="w-full">
            로그인
          </Button>
        </form>
      </div>
    </div>
  )
}

