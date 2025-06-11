import { notFound, redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoonStar,
  Eye,
  Heart,
  Lightbulb,
  Sparkles,
  CreditCard,
} from "lucide-react";
import { ArchetypeCard } from "@/components/ui/archetype-card";
import { RelatedSymbols } from "@/components/ui/related-symbols";
import { Suspense } from "react";

interface AnalysisReport {
  id: string;
  user_id: string;
  created_at: string;
  input_text: string;
  report_data: {
    keySymbols: string[];
    emotionalFlow: string;
    freudianPerspective: string;
    jungianPerspective: string;
    oneiriSynthesis: string;
    archetypeCardKey?: string;
    relatedSymbols?: Array<{
      symbolName: string;
      question: string;
    }>;
    oneiriNote?: string;
  };
}

// 스켈레톤 로딩 컴포넌트
function AnalysisReportSkeleton() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-4xl">
      <div className="mb-6 sm:mb-8 text-center sm:text-left">
        <Skeleton className="h-8 sm:h-10 lg:h-12 w-48 sm:w-64 mb-2 sm:mb-3" />
        <Skeleton className="h-4 sm:h-5 w-32 sm:w-40" />
      </div>

      <div className="space-y-4 sm:space-y-6 lg:space-y-8">
        {/* 원본 꿈 내용 스켈레톤 */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
              <Skeleton className="h-5 sm:h-6 w-32" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/50 p-3 sm:p-4 lg:p-6 rounded-lg space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>

        {/* 주요 상징 스켈레톤 */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
              <Skeleton className="h-5 sm:h-6 w-40" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 sm:gap-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton
                  key={i}
                  className="h-6 sm:h-7 w-16 sm:w-20 rounded-full"
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 정서적 흐름 스켈레톤 */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
              <Skeleton className="h-5 sm:h-6 w-36" />
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
        </Card>

        {/* 분석가의 관점 스켈레톤 */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
          {[1, 2].map((i) => (
            <Card
              key={i}
              className="shadow-lg border-0 bg-card/50 backdrop-blur"
            >
              <CardHeader className="pb-3 sm:pb-4">
                <Skeleton className="h-5 sm:h-6 w-3/4" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Oneiri의 종합 해석 스켈레톤 */}
        <Card className="border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
              <Skeleton className="h-5 sm:h-6 w-40" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-primary/10 p-4 sm:p-6 rounded-lg border border-primary/20 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* 꿈의 원형 카드 스켈레톤 */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
          <CardHeader className="pb-3 sm:pb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 sm:h-6 sm:w-6 rounded" />
              <Skeleton className="h-5 sm:h-6 w-44" />
            </div>
            <Skeleton className="h-4 w-full mt-2" />
            <Skeleton className="h-4 w-2/3" />
          </CardHeader>
          <CardContent>
            <div className="flex justify-center">
              <Skeleton className="w-72 h-96 rounded-lg" />
            </div>
          </CardContent>
        </Card>

        {/* 피드백 섹션 스켈레톤 */}
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
          <CardContent className="pt-4 sm:pt-6">
            <div className="text-center">
              <Skeleton className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3 rounded" />
              <div className="space-y-2 max-w-md mx-auto">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6 mx-auto" />
                <Skeleton className="h-3 w-4/5 mx-auto" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// 실제 컨텐츠 컴포넌트
async function AnalysisReportContent({ params }: { params: { id: string } }) {
  try {
    const supabase = await createClient();

    // 사용자 인증 확인
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      redirect("/login");
    }

    // 리포트 데이터 조회
    const { data: report, error } = await supabase
      .from("analysis_reports")
      .select("*")
      .eq("id", params.id)
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Database error:", error);
      notFound();
    }

    if (!report) {
      notFound();
    }

    const reportData = report as AnalysisReport;

    // 데이터 유효성 검사
    if (
      !reportData.report_data ||
      !reportData.report_data.keySymbols ||
      !reportData.report_data.emotionalFlow ||
      !reportData.report_data.freudianPerspective ||
      !reportData.report_data.jungianPerspective ||
      !reportData.report_data.oneiriSynthesis
    ) {
      console.error("Invalid report data structure:", reportData);
      notFound();
    }

    const createdDate = new Date(reportData.created_at).toLocaleDateString(
      "ko-KR",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );

    return (
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-4xl">
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3">
            꿈 분석 리포트
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base">
            생성일: {createdDate}
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* 원본 꿈 내용 */}
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
                분석된 꿈 내용
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 p-3 sm:p-4 lg:p-6 rounded-lg">
                <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">
                  {reportData.input_text}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 주요 상징 및 장면 */}
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Sparkles className="h-5 w-5 sm:h-6 sm:w-6" />
                꿈의 주요 상징 및 장면
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 sm:gap-3">
                {reportData.report_data.keySymbols.map((symbol, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5"
                  >
                    {symbol}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 정서적 흐름 */}
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <Heart className="h-5 w-5 sm:h-6 sm:w-6" />
                이야기의 정서적 흐름
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-sm sm:text-base">
                {reportData.report_data.emotionalFlow}
              </p>
            </CardContent>
          </Card>

          {/* 분석가의 관점 */}
          <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
            {/* 프로이트적 관점 */}
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">
                  관점 A: 프로이트적 해석
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-sm sm:text-base">
                  {reportData.report_data.freudianPerspective}
                </p>
              </CardContent>
            </Card>

            {/* 융의 관점 */}
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="text-base sm:text-lg">
                  관점 B: 융의 분석심리학적 해석
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="leading-relaxed text-sm sm:text-base">
                  {reportData.report_data.jungianPerspective}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Oneiri의 종합 해석 */}
          <Card className="border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-secondary/5 backdrop-blur">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <MoonStar className="h-5 w-5 sm:h-6 sm:w-6" />
                Oneiri의 종합 해석
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-primary/10 p-4 sm:p-6 rounded-lg border border-primary/20">
                <p className="leading-relaxed font-medium text-sm sm:text-base">
                  {reportData.report_data.oneiriSynthesis}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 꿈의 원형 카드 */}
          {reportData.report_data.archetypeCardKey && (
            <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
              <CardHeader className="pb-3 sm:pb-4">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
                  🃏 당신의 꿈 원형 카드
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  AI가 분석한 당신의 꿈에서 가장 핵심적인 심리적 테마를 대표하는
                  원형입니다.
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <div className="max-w-xs w-full">
                    <ArchetypeCard
                      archetypeKey={reportData.report_data.archetypeCardKey}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 연관된 상징 탐험하기 */}
          {reportData.report_data.relatedSymbols &&
            reportData.report_data.relatedSymbols.length > 0 && (
              <RelatedSymbols symbols={reportData.report_data.relatedSymbols} />
            )}

          {/* Oneiri의 마지막 메모 */}
          {reportData.report_data.oneiriNote && (
            <Card className="border-primary/20 shadow-lg bg-gradient-to-br from-blue-50/50 to-indigo-50/50 dark:from-slate-800/70 dark:to-slate-900/70 backdrop-blur">
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-2xl mb-3">💫</div>
                  <p className="text-sm sm:text-base leading-relaxed font-medium text-muted-foreground italic">
                    "{reportData.report_data.oneiriNote}"
                  </p>
                  <div className="mt-4 text-xs text-muted-foreground/70">
                    — Oneiri
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 피드백 섹션 */}
          <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
            <CardContent className="pt-4 sm:pt-6">
              <div className="text-center text-muted-foreground">
                <Lightbulb className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 sm:mb-3" />
                <p className="text-xs sm:text-sm leading-relaxed max-w-md mx-auto">
                  이 분석이 도움이 되었나요? 꿈은 개인적인 경험이므로, 이 해석을
                  참고 자료로 활용하시고 자신만의 해석을 더해보세요.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Page error:", error);
    notFound();
  }
}

// 메인 export 컴포넌트
export default function AnalysisReportPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <Suspense fallback={<AnalysisReportSkeleton />}>
      <AnalysisReportContent params={params} />
    </Suspense>
  );
}
