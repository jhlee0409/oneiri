"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient, SUPABASE_URL } from "@/utils/supabase/client";
import { Sparkles, Info } from "lucide-react";
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

interface ArchetypeCardData {
  key: string;
  name: string;
  keywords: string[];
  image_url: string;
  description: string;
}

interface ArchetypeCardProps {
  archetypeKey: string;
}

export function ArchetypeCard({ archetypeKey }: ArchetypeCardProps) {
  const [cardData, setCardData] = useState<ArchetypeCardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isValidKey, setIsValidKey] = useState(true);

  // Enhanced validation and secure image URL generation
  const { imageUrl, valid } = useMemo(() => {
    // Strict validation for archetypeKey
    const validateArchetypeKey = (key: string): string | null => {
      // Basic checks
      if (!key || typeof key !== "string") {
        return null;
      }

      // Length limits (reasonable range for archetype keys)
      if (key.length < 2 || key.length > 50) {
        return null;
      }

      // Check for path traversal attempts
      if (
        key.includes("..") ||
        key.includes("./") ||
        key.includes("/") ||
        key.includes("\\")
      ) {
        return null;
      }

      // Check for null bytes and other dangerous characters
      if (
        key.includes("\0") ||
        key.includes("%") ||
        key.includes("<") ||
        key.includes(">")
      ) {
        return null;
      }

      // Strict pattern: must start with letter, can contain letters, numbers, hyphens, underscores
      // No consecutive special characters, must end with alphanumeric
      const strictPattern =
        /^[a-zA-Z][a-zA-Z0-9]*(?:[_-][a-zA-Z0-9]+)*[a-zA-Z0-9]$|^[a-zA-Z0-9]$/;

      if (!strictPattern.test(key)) {
        return null;
      }

      // Additional check: no more than 2 consecutive identical characters
      if (/(.)\1{2,}/.test(key)) {
        return null;
      }

      return key;
    };

    const validatedKey = validateArchetypeKey(archetypeKey);

    if (!validatedKey) {
      console.warn(`Invalid archetype key: ${archetypeKey}`);
      // Return a safe fallback URL for a default/error image
      return {
        imageUrl: `${SUPABASE_URL}/storage/v1/object/public/dream-images/archetype-card/default.png`,
        valid: false,
      };
    }

    return {
      imageUrl: `${SUPABASE_URL}/storage/v1/object/public/dream-images/archetype-card/${validatedKey}.png`,
      valid: true,
    };
  }, [archetypeKey]);

  // Update isValidKey state when validation result changes
  useEffect(() => {
    setIsValidKey(valid);
  }, [valid]);

  useEffect(() => {
    const fetchCardData = async () => {
      try {
        const supabase = createClient();
        const { data, error } = await supabase
          .from("archetype_cards")
          .select("*")
          .eq("key", archetypeKey)
          .single();

        if (error) {
          console.error("카드 데이터 조회 오류:", error);
          setError("카드 데이터를 불러올 수 없습니다.");
          return;
        }

        setCardData(data);
      } catch (err) {
        console.error("카드 데이터 조회 실패:", err);
        setError("카드 데이터를 불러올 수 없습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (archetypeKey) {
      fetchCardData();
    }
  }, [archetypeKey]);

  // 3D 기울기 효과를 위한 마우스 움직임 처리
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10; // -10 to 10 degrees
    const rotateY = ((x - centerX) / centerX) * 10; // -10 to 10 degrees

    setMousePosition({ x: rotateY, y: rotateX });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setMousePosition({ x: 0, y: 0 });
  };

  if (isLoading) {
    return (
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
        <CardContent className="p-6 text-center">
          <div className="animate-pulse">
            <div className="h-48 bg-muted rounded-lg mb-4"></div>
            <div className="h-6 bg-muted rounded w-3/4 mx-auto mb-2"></div>
            <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !cardData) {
    return (
      <Card className="shadow-lg border-0 bg-card/50 backdrop-blur">
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">
            {(!isValidKey || error) && "카드를 표시할 수 없습니다."}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative group perspective-1000">
      <Card
        className="shadow-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/10 backdrop-blur transition-all duration-300 hover:shadow-2xl hover:border-primary/30"
        style={{
          transform: `perspective(1000px) rotateX(${
            mousePosition.y
          }deg) rotateY(${mousePosition.x}deg) scale(${isHovered ? 1.02 : 1})`,
          transformStyle: "preserve-3d",
          transition: isHovered
            ? "transform 0.1s ease-out"
            : "transform 0.5s ease-out",
        }}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <CardContent className="p-0">
          {/* 카드 이름 - 이미지 위로 이동 */}
          <div className="p-4 pb-2 text-center">
            <div className="flex items-center justify-center gap-2">
              <h3 className="text-lg font-bold text-primary tracking-wide">
                {cardData.name}
              </h3>
              {/* 설명 툴팁 아이콘 */}
              <div className="relative">
                <Info
                  className="w-4 h-4 text-muted-foreground hover:text-primary cursor-help transition-colors"
                  onMouseEnter={() => setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                />
                {/* 툴팁 */}
                {showTooltip && (
                  <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 w-64 p-3 bg-popover border border-border rounded-lg shadow-lg text-sm text-popover-foreground leading-relaxed">
                    {cardData.description}
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-popover border-l border-t border-border rotate-45"></div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 카드 이미지 영역 */}
          <div className="relative aspect-[2/3] overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 mx-4 rounded-lg">
            <ImageWithFallback
              src={imageUrl}
              alt={archetypeKey}
              fill
              className="object-cover"
              fallbackMessage={
                !isValidKey
                  ? "유효하지 않은 카드 키"
                  : "이미지를 불러올 수 없습니다"
              }
              containerClassName="w-full h-full"
              onError={(e) => {
                console.error(
                  `아키타입 카드 이미지 로드 실패: ${archetypeKey}`,
                  e
                );
                if (!isValidKey) {
                  console.warn(
                    "Invalid archetype key caused image load failure"
                  );
                }
              }}
            />
            {/* 오버레이 효과 */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* 3D 효과를 위한 하이라이트 */}
            <div
              className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 transition-opacity duration-300 pointer-events-none"
              style={{
                opacity: isHovered ? 0.1 : 0,
                background: `radial-gradient(circle at ${
                  ((mousePosition.x + 10) / 20) * 100
                }% ${
                  ((mousePosition.y + 10) / 20) * 100
                }%, rgba(255,255,255,0.3) 0%, transparent 50%)`,
              }}
            ></div>
          </div>

          {/* 키워드 영역 - 간결한 텍스트로 변경 */}
          <div className="p-4 pt-3 text-center">
            <div className="text-xs text-muted-foreground leading-relaxed">
              {cardData.keywords.map((keyword, index) => (
                <span key={index}>
                  {keyword}
                  {index < cardData.keywords.length - 1 && (
                    <span className="mx-1 opacity-50">·</span>
                  )}
                </span>
              ))}
            </div>

            {/* 장식 요소 */}
            <div className="flex justify-center mt-3">
              <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 카드 주위 미세한 빛 효과 - 3D 효과에 맞춰 조정 */}
      <div
        className="absolute inset-0 -z-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 blur-xl transition-opacity duration-500"
        style={{
          opacity: isHovered ? 0.4 : 0,
          transform: `perspective(1000px) rotateX(${mousePosition.y}deg) rotateY(${mousePosition.x}deg) scale(1.05)`,
          transition: isHovered ? "all 0.1s ease-out" : "all 0.5s ease-out",
        }}
      ></div>
    </div>
  );
}
