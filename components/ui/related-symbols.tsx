"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Telescope, Sparkles } from "lucide-react";

interface RelatedSymbol {
  symbolName: string;
  question: string;
}

interface RelatedSymbolsProps {
  symbols: RelatedSymbol[];
}

export function RelatedSymbols({ symbols }: RelatedSymbolsProps) {
  if (!symbols || symbols.length === 0) {
    return null;
  }

  return (
    <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle asChild className="flex items-center gap-2 text-lg sm:text-xl">
          <h2>
            <Telescope className="h-5 w-5 sm:h-6 sm:w-6 text-primary" aria-hidden="true" />
            연관된 상징 탐험하기
          </h2>
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          당신의 꿈과 심리학적으로 연결된 다른 상징들을 탐구해보세요.
        </p>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {symbols.map((symbol, index) => (
            <li
              key={index}
              className="group p-4 rounded-lg border border-primary/10 bg-primary/5 hover:bg-primary/10 transition-colors duration-200 hover:border-primary/20"
            >
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  {/* 상징 이름 */}
                  <h3 className="font-semibold text-primary text-base">
                    {symbol.symbolName}
                  </h3>

                  {/* 성찰 질문 */}
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "{symbol.question}"
                  </p>
                </div>

                {/* 장식 요소 */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Sparkles className="h-4 w-4 text-primary/60" aria-hidden="true" />
                </div>
              </div>
            </li>
          ))}
        </ul>

        {/* 하단 안내 텍스트 */}
        <div className="mt-6 pt-4 border-t border-primary/10">
          <p className="text-xs text-muted-foreground text-center leading-relaxed">
            이 상징들은 당신의 꿈과 연결된 무의식의 메시지일 수 있습니다. 각
            질문에 대해 깊이 생각해보며 내면을 탐구해보세요.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
