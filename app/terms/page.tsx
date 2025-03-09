"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center mb-6">서비스 소개</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-primary">서비스 개요</h2>
            <p className="text-muted-foreground leading-relaxed">
              이 웹 서비스는 주소 데이터를 효율적으로 관리하고 시각화하기 위한 전문 도구입니다. 
              카카오맵 API를 활용하여 주소 정보를 지도상에서 직관적으로 확인할 수 있으며, 
              데이터 관리와 분석을 위한 다양한 기능을 제공합니다.

              크롤링 기능 추가 계획입니다.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-primary">주요 기능</h2>
            <div className="grid gap-4">
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">🗺️ 지도 시각화</h3>
                <p className="text-sm text-muted-foreground">
                  카카오맵을 통한 주소 위치 확인 및 시각화
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">📥 데이터 관리</h3>
                <p className="text-sm text-muted-foreground">
                  엑셀 형식의 데이터 다운로드 및 이력 관리
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">🔍 주소 검색</h3>
                <p className="text-sm text-muted-foreground">
                  도로명/지번 주소 검색 및 위치 확인
                </p>
              </div>
              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">🔒 보안</h3>
                <p className="text-sm text-muted-foreground">
                  PIN 인증을 통한 안전한 접근 관리
                </p>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-primary">사용 환경</h2>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <span className="font-medium">💻 PC 환경 최적화</span><br />
                본 서비스는 PC 환경에서의 사용을 권장합니다. 모바일 환경에서는 일부 기능이 제한될 수 있습니다.
              </p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-primary">데이터 관리</h2>
            <p className="text-muted-foreground leading-relaxed">
              다운로드 이력은 로컬 스토리지에 30일간 저장되며, 보안을 위해 세션은 24시간 후 자동 만료됩니다.
              모든 데이터는 사용자의 브라우저에서 로컬로 관리되어 보안성을 높였습니다.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  )
} 