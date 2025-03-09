"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center mb-6">개인정보처리방침</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-primary">1. 개인정보의 처리 목적</h2>
            <p className="text-muted-foreground leading-relaxed">
              본 서비스는 회원가입 없이 PIN 인증만으로 운영되며, 
              사용자의 개인정보를 별도로 수집하지 않습니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-primary">2. 처리하는 개인정보의 항목</h2>
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="text-muted-foreground">
                <span className="font-medium">필수항목</span>: 없음
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium">선택항목</span>: 없음
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-primary">3. 개인정보의 보관 및 파기</h2>
            <div className="space-y-2">
              <h3 className="font-medium">로컬 스토리지 데이터</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
                <li>다운로드 이력: 30일 후 자동 삭제</li>
                <li>인증 정보: 24시간 후 자동 삭제</li>
                <li>모든 데이터는 사용자의 브라우저에만 저장되며, 별도의 서버에 저장되지 않습니다.</li>
              </ul>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-primary">4. 사용자 데이터 보호</h2>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 leading-relaxed">
                본 서비스에서 처리되는 주소 데이터는 사용자의 브라우저에서만 처리되며,
                외부 서버로 전송되지 않습니다. 지도 표시를 위한 카카오맵 API 사용 시에도
                최소한의 위치 정보만을 활용합니다.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-primary">5. 이용자 및 법정대리인의 권리와 행사방법</h2>
            <p className="text-muted-foreground leading-relaxed">
              본 서비스는 별도의 개인정보를 수집하지 않으므로, 
              언제든지 브라우저 설정에서 로컬 스토리지를 삭제하실 수 있습니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-primary">6. 개인정보 보호책임자</h2>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-muted-foreground">
                개인정보 보호책임자: - <br />
                연락처: 010-7327-9914 <br />
                이메일: jwoon0727@icloud.com
              </p>
            </div>
          </section>

          <section className="mt-8 pt-6 border-t">
            <p className="text-sm text-muted-foreground">
              본 개인정보처리방침은 2025년 3월 9일부터 적용됩니다.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
} 