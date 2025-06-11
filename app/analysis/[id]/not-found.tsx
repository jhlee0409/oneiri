import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MoonStar, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-2xl">
      <div className="text-center">
        <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
          <CardHeader className="pb-4">
            <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <CardTitle className="text-xl sm:text-2xl mb-2">
              분석 리포트를 찾을 수 없습니다
            </CardTitle>
            <p className="text-muted-foreground text-sm sm:text-base">
              요청하신 꿈 분석 리포트가 존재하지 않거나 접근 권한이 없습니다.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild variant="default" className="w-full sm:w-auto">
                <Link href="/analysis/new" className="flex items-center gap-2">
                  <MoonStar className="h-4 w-4" />
                  새로운 꿈 분석하기
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full sm:w-auto">
                <Link
                  href="/library/dreams"
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />내 서재로 돌아가기
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
