"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Github } from "lucide-react"
export default function LoginPage() {
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Only allow numbers
    if (/^\d*$/.test(value) && value.length <= 6) {
      setPin(value)
      setError("")
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // PIN 번호 검증
    if (pin.length < 4) {
      setError("PIN must be at least 4 digits")
      return
    }

    // PIN 번호가 0727인지 확인
    if (pin !== "0727") {
      setError("잘못된 PIN 번호입니다")
      return
    }

    // 인증 상태를 localStorage에 저장
    localStorage.setItem('isAuthenticated', 'true')
    // 인증 시간 저장 (24시간 후 만료)
    localStorage.setItem('authExpires', (Date.now() + 24 * 60 * 60 * 1000).toString())

    // 올바른 PIN 번호일 경우 대시보드로 이동
    router.push("/dashboard")
  }

  return (
    <div className="flex flex-1 items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">PIN 로그인</CardTitle>
          <CardDescription className="text-center">계속하려면 PIN 번호를 입력하세요</CardDescription>
          <div className="mt-2 text-center">
            <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">
              PC  사용을 권장합니다.
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="pin"
                type="password"
                placeholder="PIN 번호 입력"
                value={pin}
                onChange={handlePinChange}
                className="text-center text-xl tracking-widest"
                maxLength={6}
              />
              {error && <p className="text-sm text-red-500">{error}</p>}
            </div>
            <Button type="submit" className="w-full">
              로그인
            </Button>
          </form>
<br></br>
<div className="flex items-center justify-center gap-4">
  <Link href="/terms" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
    소개 
  </Link>
  <span className="text-muted-foreground">•</span>
  <Link href="/privacy" className="text-sm text-muted-foreground underline-offset-4 hover:underline">
    개인정보처리방침
  </Link>
  <span className="text-muted-foreground">•</span>
  <Link
    href="https://github.com"
    target="_blank"
    rel="noreferrer"
    className="text-sm text-muted-foreground hover:text-foreground"
  >
    <Github className="h-4 w-4" />
    <span className="sr-only">GitHub</span>
  </Link>
</div>
        </CardContent>
      </Card>
    </div>
  )
}
