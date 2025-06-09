"use client";

import { useState, useEffect } from "react";
import {
  Megaphone,
  Calendar,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

interface GitHubRelease {
  id: number;
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
  html_url: string;
  prerelease: boolean;
  draft: boolean;
}

export default function NoticesPage() {
  const [releases, setReleases] = useState<GitHubRelease[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedReleases, setExpandedReleases] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    fetchReleases();
  }, []);

  const fetchReleases = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://api.github.com/repos/jhlee0409/oneiri/releases",
        {
          headers: {
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
          },
        }
      );

      if (!response.ok) {
        throw new Error("릴리즈 정보를 가져올 수 없습니다.");
      }

      const data = await response.json();
      // draft가 아닌 릴리즈만 표시
      const publishedReleases = data.filter(
        (release: GitHubRelease) => !release.draft
      );
      setReleases(publishedReleases);

      // 최신 릴리즈는 기본적으로 펼쳐놓기
      if (publishedReleases.length > 0) {
        setExpandedReleases(new Set([publishedReleases[0].id]));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "알 수 없는 오류가 발생했습니다."
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (releaseId: number) => {
    const newExpanded = new Set(expandedReleases);
    if (newExpanded.has(releaseId)) {
      newExpanded.delete(releaseId);
    } else {
      newExpanded.add(releaseId);
    }
    setExpandedReleases(newExpanded);
  };

  const formatReleaseBody = (body: string) => {
    // 간단한 마크다운 형식 처리
    return body
      .replace(
        /^## (.*$)/gim,
        '<h3 class="text-lg font-semibold oneiri-text-primary mb-2">$1</h3>'
      )
      .replace(
        /^### (.*$)/gim,
        '<h4 class="text-base font-medium oneiri-text-primary mb-2">$1</h4>'
      )
      .replace(/^\d+\. (.*$)/gim, '<li class="mb-1">$1</li>')
      .replace(/^- (.*$)/gim, '<li class="mb-1">$1</li>')
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .split("\n")
      .map((line) => {
        if (line.includes("<li")) {
          return line;
        }
        return line.trim() ? `<p class="mb-2">${line}</p>` : "";
      })
      .join("")
      .replace(
        /(<li.*?>.*?<\/li>)/g,
        '<ul class="list-disc list-inside ml-4 space-y-1">$1</ul>'
      );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen oneiri-bg-primary py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="oneiri-bg-secondary rounded-lg shadow-lg p-8">
            <div className="animate-pulse">
              <div className="h-8 oneiri-bg-primary rounded mb-4"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 oneiri-bg-primary rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen oneiri-bg-primary py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="oneiri-bg-secondary rounded-lg shadow-lg p-8 text-center">
            <Megaphone className="w-16 h-16 oneiri-accent mx-auto mb-4" />
            <h1 className="text-2xl font-bold oneiri-text-primary mb-4">
              공지사항을 불러올 수 없습니다
            </h1>
            <p className="oneiri-text-secondary mb-6">{error}</p>
            <button
              onClick={fetchReleases}
              className="px-6 py-2 oneiri-accent-bg text-white rounded-lg hover:bg-accent-secondary transition-colors"
            >
              다시 시도
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen oneiri-bg-primary py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="oneiri-bg-secondary rounded-lg shadow-lg p-8 md:p-12">
          {/* 헤더 */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Megaphone className="w-8 h-8 oneiri-accent" />
              <h1 className="text-3xl font-bold oneiri-text-primary">
                업데이트 공지사항
              </h1>
            </div>
            <p className="oneiri-text-secondary text-lg">
              Oneiri의 최신 업데이트와 새로운 기능을 확인해보세요 ✨
            </p>
          </div>

          {/* 릴리즈 목록 */}
          {releases.length === 0 ? (
            <div className="text-center py-12">
              <Megaphone className="w-16 h-16 oneiri-text-secondary mx-auto mb-4 opacity-50" />
              <p className="oneiri-text-secondary text-lg">
                아직 공지사항이 없습니다.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {releases.map((release, index) => (
                <div
                  key={release.id}
                  className="oneiri-bg-primary border border-text-secondary/20 rounded-lg overflow-hidden"
                >
                  {/* 릴리즈 헤더 */}
                  <div
                    className="p-6 cursor-pointer hover:bg-text-secondary/5 transition-colors"
                    onClick={() => toggleExpanded(release.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {index === 0 && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gradient-to-r from-oneiri-violet to-oneiri-purple text-white">
                              최신
                            </span>
                          )}
                          {release.prerelease && (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                              프리릴리즈
                            </span>
                          )}
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold oneiri-text-primary">
                            {release.name || release.tag_name}
                          </h2>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="w-4 h-4 oneiri-text-secondary" />
                            <span className="oneiri-text-secondary text-sm">
                              {formatDate(release.published_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a
                          href={release.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 oneiri-text-secondary hover:oneiri-accent transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                        {expandedReleases.has(release.id) ? (
                          <ChevronUp className="w-5 h-5 oneiri-text-secondary" />
                        ) : (
                          <ChevronDown className="w-5 h-5 oneiri-text-secondary" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 릴리즈 내용 (확장 시) */}
                  {expandedReleases.has(release.id) && (
                    <div className="px-6 pb-6 border-t border-text-secondary/10">
                      <div className="pt-4">
                        {release.body ? (
                          <div
                            className="prose prose-lg max-w-none oneiri-text-primary/90 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: formatReleaseBody(release.body),
                            }}
                          />
                        ) : (
                          <p className="oneiri-text-secondary italic">
                            이 릴리즈에 대한 상세 설명이 없습니다.
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* 푸터 */}
          <div className="mt-12 pt-8 border-t border-text-secondary/20 text-center">
            <p className="oneiri-text-secondary">
              더 많은 업데이트 정보는{" "}
              <a
                href="https://github.com/jhlee0409/oneiri/releases"
                target="_blank"
                rel="noopener noreferrer"
                className="oneiri-accent underline hover:text-accent-primary/80"
              >
                GitHub 릴리즈 페이지
              </a>
              에서 확인하실 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
