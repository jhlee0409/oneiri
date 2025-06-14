"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import Image from "next/image";

interface MomentOfRevelationProps {
  isOpen: boolean;
  onClose: () => void;
  cardData: {
    id: string;
    title: string;
    archetype: string;
    imageUrl: string;
    symbolMeaning?: string;
  };
  onClick: () => void;
}

export function MomentOfRevelation({
  isOpen,
  onClose,
  cardData,
  onClick,
}: MomentOfRevelationProps) {
  const [currentPhase, setCurrentPhase] = useState(0);
  const [showHoverIcon, setShowHoverIcon] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentPhase(0);
      const timers = [
        setTimeout(() => setCurrentPhase(1), 0), // Phase 1: 카드 제시
        setTimeout(() => setCurrentPhase(2), 1000), // Phase 2: 의미 부여
        setTimeout(() => setCurrentPhase(3), 3500), // Phase 3: 행동 유도
      ];

      return () => timers.forEach(clearTimeout);
    }
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleEscKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
      return () => document.removeEventListener("keydown", handleEscKey);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={handleOverlayClick}
        >
          {/* Phase 0-1: 카드만 보이는 상태 */}
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative z-10 mb-40"
          >
            {/* 카드 본체 */}
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative"
            >
              <div className="relative aspect-[2/3] h-[450px] rounded-xl overflow-hidden shadow-2xl">
                {/* 카드 이미지 */}
                <Image
                  src={cardData.imageUrl}
                  alt={cardData.title}
                  fill
                  className="object-cover"
                />

                {/* 카드 정보 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{cardData.title}</h3>
                  <p className="text-sm opacity-90">{cardData.symbolMeaning}</p>
                </div>
              </div>

              {/* 금빛 입자 효과 */}
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute w-1 h-1 bg-yellow-400 rounded-full"
                    initial={{
                      x: Math.random() * 320 - 160,
                      y: Math.random() * 450 - 225,
                      opacity: 0,
                    }}
                    animate={{
                      x: Math.random() * 320 - 160,
                      y: Math.random() * 450 - 225,
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* Phase 2-3: 오버레이, 배경, 텍스트, 버튼 */}
          <AnimatePresence>
            {currentPhase >= 2 && (
              <>
                {/* 어두운 오버레이 */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.7 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: "easeIn" }}
                  className="absolute inset-0 bg-navy-900"
                />

                {/* 텍스트 콘텐츠 */}
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20">
                  <div className="text-center max-w-2xl px-8 mt-[500px]">
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1 }}
                      className="text-lg text-slate-300 mb-4"
                    >
                      눈을 뜨면 사라지는 꿈의 조각들처럼,
                    </motion.p>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 1.5 }}
                      className="text-lg text-slate-100"
                    >
                      이 카드 또한 당신이 놓쳤을지 모를 소중한 기억입니다.
                    </motion.p>
                  </div>

                  {/* CTA 버튼들 */}
                  {currentPhase >= 3 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="flex gap-4 mt-12"
                    >
                      <Button
                        onClick={onClick}
                        onMouseEnter={() => setShowHoverIcon(true)}
                        onMouseLeave={() => setShowHoverIcon(false)}
                        className="bg-gold-500 text-navy-900 hover:bg-gold-300 hover:scale-[1.03] transition-all duration-200 text-base px-6 py-3"
                      >
                        <AnimatePresence>
                          {showHoverIcon && (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: -10 }}
                              className="mr-1"
                            >
                              <Pencil className="w-4 h-4" />
                            </motion.div>
                          )}
                        </AnimatePresence>
                        내 진짜 꿈으로 카드 만들기
                      </Button>
                    </motion.div>
                  )}
                </div>
              </>
            )}
          </AnimatePresence>
          {/* 뒤로가기 버튼 */}
          <button
            onClick={onClose}
            className="absolute z-50 top-4 right-4 text-slate-400 hover:text-slate-200 transition-colors"
          >
            ✕
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
