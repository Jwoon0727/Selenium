import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { pin } = await request.json()

  // 여기서는 간단한 예시로 PIN이 "1234"인 경우에만 인증 성공
  // 실제 구현에서는 안전한 인증 로직을 사용해야 합니다
  if (pin === "7327") {
    const response = NextResponse.json({ success: true })
    response.cookies.set('auth', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24 hours
    })
    return response
  }

  return NextResponse.json(
    { success: false, message: "올바른 PIN 번호를 입력해주세요." },
    { status: 401 }
  )
} 