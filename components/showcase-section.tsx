"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MomentOfRevelation } from "./moment-of-revelation";
import { Button } from "@/components/ui/button";
import { Moon, Sparkles } from "lucide-react";
import { ImageWithFallback } from "./ui/image-with-fallback";
import { useRouter } from "next/navigation";

// 데모용 카드 데이터
const DEMO_CARDS = [
  {
    id: "demo-1",
    title: "The Discovery",
    archetype: "the_discovery",
    imageUrl: "/images/dream-cards/the_discovery.png",
    symbolMeaning:
      "당신의 무의식은 지금 새로운 기회와 깨달음을 마주할 준비가 되었어요.",
  },
  {
    id: "demo-2",
    title: "The Flight",
    archetype: "the_flight",
    imageUrl: "/images/dream-cards/the_flight.png",
    symbolMeaning:
      "마음속 깊은 곳에서부터, 현실의 제약을 벗어난 진정한 자유를 갈망하고 있군요.",
  },
  {
    id: "demo-3",
    title: "The Growth",
    archetype: "the_growth",
    imageUrl: "/images/dream-cards/the_growth.png",
    symbolMeaning:
      "보이지 않는 곳에서부터, 당신의 잠재력은 조용하지만 단단하게 자라나고 있습니다.",
  },
];

export function ShowcaseSection({ isLoggedIn }: { isLoggedIn: boolean }) {
  const router = useRouter();
  const [showDemo, setShowDemo] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedCard, setSelectedCard] = useState<
    (typeof DEMO_CARDS)[0] | null
  >(null);
  const [showRevelation, setShowRevelation] = useState(false);

  const handleDrawCard = async () => {
    setIsDrawing(true);

    // 카드 뽑기 애니메이션 (2초)
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // 랜덤 카드 선택
    const randomCard =
      DEMO_CARDS[Math.floor(Math.random() * DEMO_CARDS.length)];
    setSelectedCard(randomCard);
    setIsDrawing(false);

    // 계시의 순간 표시
    setTimeout(() => {
      setShowRevelation(true);
    }, 500);
  };

  return (
    <section className="py-12 sm:py-16 md:py-20 lg:py-[120px] bg-navy-900">
      <div
        className="grid-oneiri items-center gap-8 sm:gap-10 md:gap-12 lg:gap-12"
        style={{ gap: "32px" }}
      >
        {/* Text Area - Columns 1-5 */}
        <div className="col-span-12 lg:col-span-5 px-4 sm:px-6 lg:px-0 text-center lg:text-left">
          <h2 className="font-serif font-bold text-xl sm:text-2xl md:text-3xl lg:text-headline text-slate-100 mb-4 sm:mb-6 whitespace-pre-line">
            {`말로 설명하기 어려운 꿈,\n이제는 이야기로 남겨보세요.`}
          </h2>
          <p className="text-sm sm:text-base md:text-body text-slate-300 max-w-lg mx-auto lg:mx-0 mb-8 whitespace-pre-line">
            {`어딘가 모르게 마음에 남았던 장면.\n알 수 없는 감정.\n\n지금 그 꿈을 남겨보세요.\nAI가 당신만의 방식으로 이야기를 들려드립니다.`}
          </p>

          {/* 데모 시작 버튼 */}
          <Button
            onClick={() => setShowDemo(true)}
            size="lg"
            className="bg-gold-500 text-navy-900 hover:bg-gold-400 transition-all duration-300 transform hover:scale-105"
          >
            <Moon className="w-5 h-5 mr-2" />내 꿈 들려주기
          </Button>
        </div>

        {/* Demo Area - Columns 6-12 */}
        <div className="col-span-12 lg:col-span-7 px-4 sm:px-6 lg:px-0">
          <AnimatePresence mode="wait">
            {!showDemo ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="aspect-2/3 rounded-oneiri shadow-showcase transition-transform duration-300 hover:scale-[1.02] lg:hover:scale-[1.03] cursor-pointer overflow-hidden"
                onClick={() => setShowDemo(true)}
              >
                <ImageWithFallback
                  width={1000}
                  height={1000}
                  src="/images/showcase-section.png"
                  alt="Oneiri 쇼케이스"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="aspect-video rounded-oneiri shadow-showcase bg-navy-800 flex items-center justify-center relative overflow-hidden"
              >
                {/* 카드 뽑기 인터페이스 */}
                {!isDrawing && !selectedCard && (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-center"
                  >
                    <h3 className="text-xl sm:text-2xl font-serif font-bold text-slate-100 mb-4">
                      당신의 무의식이 전하는 메시지
                    </h3>
                    <p className="text-sm sm:text-base md:text-lg lg:text-body text-slate-300 mb-8">
                      마음을 비우고, 끌리는 순간 클릭하세요
                    </p>
                    <Button
                      onClick={handleDrawCard}
                      size="lg"
                      variant="outline"
                      className="border-gold-500 text-gold-500 hover:bg-gold-500 hover:text-navy-900"
                    >
                      카드 뽑기
                    </Button>
                  </motion.div>
                )}

                {/* 카드 뽑기 애니메이션 */}
                {isDrawing && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center"
                  >
                    <div className="mb-8">
                      {/* 카드 셔플 애니메이션 */}
                      <motion.div
                        animate={{
                          rotateY: [0, 180, 360],
                        }}
                        transition={{
                          duration: 0.5,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                        className="w-32 h-44 mx-auto bg-gradient-to-br from-gold-500 to-gold-700 rounded-lg shadow-xl"
                      >
                        <ImageWithFallback
                          width={1000}
                          height={1000}
                          src="/images/dream-cards/card-back.png"
                          alt="Oneiri 쇼케이스"
                          className="w-full h-full object-cover"
                        />
                      </motion.div>
                    </div>
                    <p className="text-slate-300 animate-pulse">
                      당신의 카드를 찾고 있습니다...
                    </p>
                  </motion.div>
                )}

                {/* 뒤로가기 버튼 */}
                <button
                  onClick={() => {
                    setShowDemo(false);
                    setSelectedCard(null);
                    setIsDrawing(false);
                  }}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
                >
                  ✕
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 계시의 순간 모달 */}
      {selectedCard && (
        <MomentOfRevelation
          isOpen={showRevelation}
          onClose={() => {
            setShowDemo(false);
            setSelectedCard(null);
            setIsDrawing(false);
          }}
          cardData={selectedCard}
          onClick={() => {
            if (isLoggedIn) {
              router.push("/dreams/new");
            } else {
              router.push("/login");
            }

            setShowRevelation(false);
            setSelectedCard(null);
            setIsDrawing(false);
          }}
        />
      )}
    </section>
  );
}
