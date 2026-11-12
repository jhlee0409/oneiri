"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Loader2,
  Lightbulb,
  ChevronDown,
  ChevronUp,
  MoonStar,
} from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import AuthGuard from "@/app/components/auth-guard";

export default function NewAnalysisClient() {
  const [dreamContent, setDreamContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showTips, setShowTips] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dreamContent.trim()) {
      setError("꿈 내용을 입력해주세요.");
      return;
    }

    if (dreamContent.trim().length < 10) {
      setError("꿈 내용을 좀 더 자세히 적어주세요. (최소 10자)");
      return;
    }

    if (dreamContent.trim().length > 2000) {
      setError("꿈 내용이 너무 깁니다. 2000자 이내로 작성해주세요.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        setError("인증 오류가 발생했습니다. 다시 로그인해주세요.");
        setIsLoading(false);
        return;
      }

      if (!session) {
        setError("로그인이 필요합니다.");
        setIsLoading(false);
        router.push("/login");
        return;
      }

      console.log("꿈 분석 요청 시작:", { contentLength: dreamContent.length });

      const response = await fetch("/api/analysis-report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ storyContent: dreamContent }),
      });
      const data = await response.json().catch(() => null);

      console.log("꿈 분석 응답:", data);

      if (!response.ok) {
        console.error("Analysis request error:", data);
        throw new Error(data?.error || "분석 중 오류가 발생했습니다.");
      }

      if (!data || !data.reportId) {
        console.error("Invalid response data:", data);
        throw new Error("잘못된 응답 데이터입니다.");
      }

      const { reportId } = data;
      console.log("분석 완료, 리포트 ID:", reportId);

      // 분석 결과 페이지로 리디렉션
      router.push(`/analysis/${reportId}`);
    } catch (err) {
      console.error("분석 오류:", err);

      // 사용자 친화적인 오류 메시지
      let errorMessage = "분석 중 오류가 발생했습니다.";

      if (err instanceof Error) {
        if (err.message.includes("AI 서비스")) {
          errorMessage =
            "AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.";
        } else if (err.message.includes("인증")) {
          errorMessage = "로그인이 필요합니다. 다시 로그인해주세요.";
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 max-w-2xl">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 sm:mb-3 text-center sm:text-left">
            깊이 있는 꿈 분석
          </h1>
          <p className="whitespace-pre-line text-muted-foreground text-sm sm:text-base leading-relaxed text-center sm:text-left">
            {`당신의 꿈을 전문적인 심리학적 관점에서 분석해드립니다.
          꿈의 상징과 무의식의 메시지를 깊이 있게 탐구해보세요.`}
          </p>
        </div>

        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
          <CardHeader className="pb-4 sm:pb-6">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <MoonStar className="h-5 w-5 sm:h-6 sm:w-6" />꿈 분석하기
            </CardTitle>
            <CardDescription className="text-sm sm:text-base leading-relaxed">
              검열하거나 다듬지 않은, 기억나는 그대로의 꿈을 들려주세요. 분석의
              가장 중요한 실마리가 됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2 sm:pt-4">
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-muted-foreground">
                    꿈 내용을 자유롭게 적어보세요
                  </label>
                </div>
                <Textarea
                  value={dreamContent}
                  onChange={(e) => setDreamContent(e.target.value)}
                  placeholder="어젯밤 꾼 꿈이나 기억에 남는 꿈을 자세히 적어주세요..."
                  className="min-h-[180px] sm:min-h-[220px] lg:min-h-[260px] resize-none text-sm sm:text-base leading-relaxed focus:ring-2 transition-all duration-200"
                  disabled={isLoading}
                />

                {/* 접이식 꿈 기록 팁 */}
                <div className="border border-primary/20 rounded-lg bg-primary/5">
                  <button
                    type="button"
                    onClick={() => setShowTips(!showTips)}
                    className="w-full p-3 sm:p-4 flex items-center justify-between text-left hover:bg-primary/10 transition-colors rounded-lg"
                  >
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium text-primary">
                        꿈 기록 팁 보기
                      </span>
                      <span className="text-xs text-muted-foreground hidden sm:inline">
                        더 좋은 분석을 위한 가이드
                      </span>
                    </div>
                    {showTips ? (
                      <ChevronUp className="h-4 w-4 text-primary" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-primary" />
                    )}
                  </button>

                  {showTips && (
                    <div className="px-3 sm:px-4 pb-3 sm:pb-4 space-y-4 border-t border-primary/20 mt-0">
                      <div className="pt-3 sm:pt-4">
                        <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                          어떻게 적어야 할지 막막하신가요? 완벽한 꿈 기록은
                          없어요. 하지만 아래 팁들이 도움이 될 거예요.
                        </p>

                        <div className="grid gap-3 sm:gap-4">
                          <div className="flex gap-2 sm:gap-3">
                            <span className="text-sm flex-shrink-0 mt-0.5">
                              ✨
                            </span>
                            <div>
                              <h4 className="text-xs font-medium mb-1">
                                첫 장면부터 시작
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                깨어났을 때 떠오른 첫 이미지부터 적어보세요.
                                어떤 장소, 인물, 사물이든 좋아요.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 sm:gap-3">
                            <span className="text-sm flex-shrink-0 mt-0.5">
                              👁️
                            </span>
                            <div>
                              <h4 className="text-xs font-medium mb-1">
                                감각적 묘사
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                무엇을 보고, 들고, 느꼈나요? 감각적 느낌을 함께
                                적으면 더 풍부한 분석이 가능해요.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 sm:gap-3">
                            <span className="text-sm flex-shrink-0 mt-0.5">
                              💭
                            </span>
                            <div>
                              <h4 className="text-xs font-medium mb-1">
                                구체적 감정 표현
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                '기뻤다' 보다는 '가슴 벅차게 기뻤다'처럼
                                구체적으로 표현해보세요.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 sm:gap-3">
                            <span className="text-sm flex-shrink-0 mt-0.5">
                              🔄
                            </span>
                            <div>
                              <h4 className="text-xs font-medium mb-1">
                                기묘한 순간
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                이상하거나 반복되는 요소들이 중요한 메시지일 수
                                있어요.
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 sm:gap-3">
                            <span className="text-sm flex-shrink-0 mt-0.5">
                              🎭
                            </span>
                            <div>
                              <h4 className="text-xs font-medium mb-1">
                                편안하게 표현
                              </h4>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                완벽하게 정리하려 하지 마세요. 떠오르는 그대로
                                편하게 적어주세요.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="text-xs sm:text-sm text-red-600 bg-red-50 dark:bg-red-950/30 dark:text-red-400 p-3 sm:p-4 rounded-lg border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-12 sm:h-14 text-sm sm:text-base font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                size="lg"
                disabled={isLoading || !dreamContent.trim()}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
                    <span className="hidden sm:inline">
                      꿈을 분석하고 있습니다...
                    </span>
                    <span className="sm:hidden">분석 중...</span>
                  </>
                ) : (
                  <>
                    <MoonStar className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span className="hidden sm:inline">내 꿈 분석하기</span>
                    <span className="sm:hidden">분석하기</span>
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  );
}