import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // 클라이언트 사이드에서 로그인 상태 확인
    return new NextResponse(
      `
      <script>
        if (!sessionStorage.getItem('isLoggedIn')) {
          window.location.href = '/'
        }
      </script>
      `,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    )
  }
  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard', '/dashboard/:path*']
}