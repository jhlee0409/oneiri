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

  // 상징 이름에서 이모지 추출 함수
  const getSymbolEmoji = (symbolName: string): string => {
    const emojiMap: { [key: string]: string } = {
      문: "🚪",
      열쇠: "🗝️",
      물: "💧",
      바다: "🌊",
      하늘: "☁️",
      새: "🕊️",
      나무: "🌳",
      꽃: "🌸",
      불: "🔥",
      달: "🌙",
      별: "⭐",
      거울: "🪞",
      책: "📖",
      길: "🛤️",
      다리: "🌉",
      집: "🏠",
      계단: "🪜",
      빛: "✨",
      그림자: "👤",
      상자: "📦",
    };

    // 상징 이름에서 키워드 찾기
    for (const [keyword, emoji] of Object.entries(emojiMap)) {
      if (symbolName.includes(keyword)) {
        return emoji;
      }
    }

    return "🔮"; // 기본 이모지
  };

  return (
    <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Telescope className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
          연관된 상징 탐험하기
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          당신의 꿈과 심리학적으로 연결된 다른 상징들을 탐구해보세요.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {symbols.map((symbol, index) => (
            <div
              key={index}
              className="group p-4 rounded-lg border border-primary/10 bg-gradient-to-r from-primary/5 to-secondary/5 hover:from-primary/10 hover:to-secondary/10 transition-all duration-200 hover:border-primary/20"
            >
              <div className="flex items-start gap-3">
                {/* 상징 이모지 */}
                <div className="flex-shrink-0 text-2xl">
                  {getSymbolEmoji(symbol.symbolName)}
                </div>

                <div className="flex-1 space-y-2">
                  {/* 상징 이름 */}
                  <h4 className="font-semibold text-primary text-base group-hover:text-primary/80 transition-colors">
                    {symbol.symbolName}
                  </h4>

                  {/* 성찰 질문 */}
                  <p className="text-sm text-muted-foreground leading-relaxed italic">
                    "{symbol.question}"
                  </p>
                </div>

                {/* 장식 요소 */}
                <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Sparkles className="h-4 w-4 text-primary/60" />
                </div>
              </div>
            </div>
          ))}
        </div>

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
