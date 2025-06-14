"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GridContainer } from "@/components/grid-container"
import { cn } from "@/lib/utils"

export function LandingHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "h-20 transition-all duration-300 z-50 w-full",
        isScrolled
          ? "fixed top-0 left-0 right-0 bg-navy-800/80 backdrop-blur-[10px]"
          : "absolute top-0 left-0 right-0 bg-transparent",
      )}
    >
      <GridContainer className="h-full">
        <div className="grid grid-cols-oneiri gap-grid h-full items-center">
          {/* Logo - 첫 번째 컬럼 시작점 */}
          <div className="col-span-3 flex items-center">
            <span className="font-serif font-bold text-2xl text-slate-100">Oneiri</span>
          </div>

          {/* Navigation - 중앙 정렬 */}
          <div className="col-span-6 flex justify-center">
            <nav className="hidden md:flex items-center space-x-12">
              <a href="#" className="text-body text-slate-100 hover:text-gold-500 transition-colors">
                꿈 분석하기
              </a>
              <a href="#" className="text-body text-slate-100 hover:text-gold-500 transition-colors">
                탐험하기
              </a>
              <a href="#" className="text-body text-slate-100 hover:text-gold-500 transition-colors">
                나의 꿈 서재
              </a>
            </nav>
          </div>

          {/* Actions - 마지막 컬럼 끝점 */}
          <div className="col-span-3 flex items-center justify-end space-x-3">
            <Button variant="ghost" size="sm">
              로그인
            </Button>
            <Button size="sm">회원가입</Button>
          </div>
        </div>
      </GridContainer>
    </header>
  )
}
