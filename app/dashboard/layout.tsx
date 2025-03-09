"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()

  useEffect(() => {
    // 브라우저 환경에서만 localStorage를 사용하기 위한 체크
    if (typeof window === 'undefined') return

    const checkAuth = () => {
      try {
        // localStorage에서 인증 정보 가져오기
        const isAuthenticated = localStorage.getItem('isAuthenticated')
        const authExpires = localStorage.getItem('authExpires')
        
        // 인증 정보가 없거나 만료 시간이 없는 경우 로그인 페이지로 이동
        if (!isAuthenticated || !authExpires) {
          console.log('인증 정보가 없습니다.')
          router.replace('/')
          return
        }

        // 인증이 만료된 경우 로그인 페이지로 이동
        if (Date.now() > parseInt(authExpires)) {
          console.log('인증이 만료되었습니다.')
          localStorage.removeItem('isAuthenticated')
          localStorage.removeItem('authExpires')
          router.replace('/')
          return
        }
      } catch (error) {
        // localStorage 접근 중 에러 발생 시 처리
        console.error('인증 확인 중 오류 발생:', error)
        router.replace('/')
      }
    }

    // 페이지 로드 시 인증 체크 실행
    checkAuth()
  }, [router])

  // 하위 컴포넌트 렌더링
  return <>{children}</>
} 