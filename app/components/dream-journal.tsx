"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, ImageIcon, Plus, BookOpen } from "lucide-react"

interface DreamEntry {
  id: string
  title: string
  createdAt: string
  preview: string
  dreamText: string
  emotion: string
  vibe: string
  keywords: string[]
  hasImage: boolean
}

function DreamEntryCard({ entry }: { entry: DreamEntry }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <Link href={`/story/${entry.id}`} className="block group">
      <article className="bg-white border-b border-gray-100 py-8 transition-colors hover:bg-gray-50">
        <div className="flex gap-6">
          {/* 썸네일/아이콘 영역 */}
          <div className="flex-shrink-0">
            {entry.hasImage ? (
              <div className="w-12 h-12 bg-gray-900 rounded flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
            ) : (
              <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-gray-600" />
              </div>
            )}
          </div>

          {/* 콘텐츠 영역 */}
          <div className="flex-1 min-w-0">
            {/* 제목과 날짜 */}
            <div className="mb-3">
              <h2 className="font-['Inter'] text-xl font-medium text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                {entry.title}
              </h2>
              <div className="flex items-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                {formatDate(entry.createdAt)}
              </div>
            </div>

            {/* 스토리 미리보기 */}
            <p className="text-gray-700 text-base leading-relaxed mb-4 line-clamp-2">{entry.preview}</p>

            {/* 메타데이터 */}
            <div className="flex items-center gap-3">
              {entry.emotion && (
                <span className="text-lg" title="꿈의 감정">
                  {entry.emotion}
                </span>
              )}
              <span className="text-sm text-gray-600">{entry.vibe}</span>
              <div className="flex gap-2">
                {entry.keywords.slice(0, 3).map((keyword, index) => (
                  <span key={index} className="text-xs text-gray-500">
                    #{keyword}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </article>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="text-center py-24">
      <div className="text-4xl mb-6 text-gray-400">📖</div>
      <h2 className="font-['Inter'] text-2xl font-medium text-gray-900 mb-3">꿈 일기가 비어있습니다</h2>
      <p className="text-gray-600 mb-8 max-w-md mx-auto">첫 번째 꿈을 기록하여 AI가 생성한 이야기를 확인해보세요</p>
      <Link
        href="/"
        className="inline-flex items-center bg-black hover:bg-gray-800 text-white font-medium py-3 px-6 transition-colors"
      >
        <Plus className="w-5 h-5 mr-2" />첫 번째 꿈 기록하기
      </Link>
    </div>
  )
}

export default function DreamJournal() {
  const [dreamEntries, setDreamEntries] = useState<DreamEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // localStorage에서 사용자의 꿈 일기 불러오기
    const loadDreams = () => {
      const savedDreams = localStorage.getItem("userDreams")
      if (savedDreams) {
        setDreamEntries(JSON.parse(savedDreams))
      }
      setIsLoading(false)
    }

    loadDreams()
  }, [])

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="flex justify-center items-center py-24">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 border-t-gray-900"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* 헤더 */}
      <header className="mb-16">
        <h1 className="font-['Inter'] text-4xl md:text-5xl font-medium text-gray-900 mb-4">나의 꿈 일기</h1>
        <p className="text-gray-600 text-lg">
          {dreamEntries.length > 0 ? `${dreamEntries.length}개의 꿈 이야기가 저장됨` : "AI가 생성한 꿈 이야기 컬렉션"}
        </p>
      </header>

      {/* 네비게이션 */}
      <nav className="flex justify-between items-center mb-12 pb-6 border-b border-gray-100">
        <Link href="/" className="text-gray-600 hover:text-black font-medium transition-colors">
          ← 꿈 입력으로 돌아가기
        </Link>

        {dreamEntries.length > 0 && <div className="text-sm text-gray-500">최신순 정렬</div>}
      </nav>

      {/* 꿈 일기 목록 또는 빈 상태 */}
      {dreamEntries.length > 0 ? (
        <main>
          {dreamEntries.map((entry) => (
            <DreamEntryCard key={entry.id} entry={entry} />
          ))}
        </main>
      ) : (
        <EmptyState />
      )}

      {/* 통계 푸터 */}
      {dreamEntries.length > 0 && (
        <footer className="mt-16 pt-8 border-t border-gray-100 text-center">
          <p className="text-sm text-gray-500">
            총 {dreamEntries.length}개의 꿈을 기록했습니다 • 계속해서 무의식을 탐험해보세요
          </p>
        </footer>
      )}

      {/* 플로팅 액션 버튼 */}
      <Link
        href="/"
        className="fixed bottom-8 right-8 bg-black hover:bg-gray-800 text-white w-14 h-14 rounded-full flex items-center justify-center transition-colors shadow-sm"
        title="새 꿈 기록하기"
      >
        <Plus className="w-6 h-6" />
      </Link>
    </div>
  )
}
