// AI Dream Diary Constants

export const DREAM_EMOTIONS = [
  { value: "신비로운", label: "신비로운", color: "#8B5CF6" },
  { value: "무서운", label: "무서운", color: "#EF4444" },
  { value: "행복한", label: "행복한", color: "#10B981" },
  { value: "슬픈", label: "슬픈", color: "#3B82F6" },
  { value: "평화로운", label: "평화로운", color: "#06B6D4" },
  { value: "흥미진진한", label: "흥미진진한", color: "#F59E0B" },
  { value: "불안한", label: "불안한", color: "#EF4444" },
  { value: "기이한", label: "기이한", color: "#8B5CF6" },
  { value: "따뜻한", label: "따뜻한", color: "#F97316" },
  { value: "차가운", label: "차가운", color: "#06B6D4" },
] as const;

export const STORY_GENRES = [
  {
    value: "mysterious",
    label: "신비로운",
    description: "수수께끼와 미스터리가 가득한",
  },
  {
    value: "fantasy",
    label: "환상적인",
    description: "마법과 상상력이 넘치는",
  },
  {
    value: "adventure",
    label: "모험적인",
    description: "스릴과 모험이 가득한",
  },
  { value: "romantic", label: "낭만적인", description: "사랑과 로맨스가 담긴" },
  {
    value: "horror",
    label: "공포스러운",
    description: "긴장감과 스릴이 넘치는",
  },
  { value: "comedy", label: "코미디", description: "유머와 웃음이 가득한" },
  { value: "drama", label: "드라마틱한", description: "감동과 여운이 남는" },
  { value: "scifi", label: "공상과학", description: "미래와 과학기술이 담긴" },
  {
    value: "slice_of_life",
    label: "일상적인",
    description: "평범하지만 따뜻한",
  },
  {
    value: "philosophical",
    label: "철학적인",
    description: "깊은 사유와 성찰이 담긴",
  },
] as const;

export const STORY_LENGTHS = [
  {
    value: "short",
    label: "짧게",
    description: "2-3문단 정도의 간결한 이야기",
  },
  {
    value: "medium",
    label: "보통",
    description: "4-5문단 정도의 적당한 이야기",
  },
  { value: "long", label: "길게", description: "6-8문단 정도의 자세한 이야기" },
] as const;

export const TAG_CATEGORIES = [
  { value: "emotion", label: "감정", color: "#EC4899" },
  { value: "place", label: "장소", color: "#059669" },
  { value: "character", label: "인물", color: "#F59E0B" },
  { value: "object", label: "사물", color: "#8B5CF6" },
  { value: "action", label: "행동", color: "#EF4444" },
  { value: "general", label: "일반", color: "#6B7280" },
] as const;

export const COMMON_DREAM_KEYWORDS = [
  // 장소
  "집",
  "학교",
  "바다",
  "산",
  "숲",
  "도시",
  "시골",
  "우주",
  "지하",
  "하늘",
  // 인물
  "친구",
  "가족",
  "연인",
  "선생님",
  "낯선 사람",
  "유명인",
  "동물",
  "몬스터",
  // 사물
  "자동차",
  "비행기",
  "책",
  "컴퓨터",
  "전화",
  "문",
  "열쇠",
  "거울",
  "시계",
  // 행동
  "날기",
  "달리기",
  "수영",
  "운전",
  "공부",
  "놀기",
  "싸우기",
  "도망가기",
  "찾기",
  // 자연
  "비",
  "눈",
  "바람",
  "태양",
  "달",
  "별",
  "꽃",
  "나무",
  "강",
  "불",
] as const;

export const PROCESSING_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const API_ENDPOINTS = {
  GENERATE_STORY: "/functions/v1/generate-dream-story",
  MANAGE_DREAMS: "/functions/v1/manage-dreams",
  USER_ANALYTICS: "/functions/v1/user-analytics",
} as const;

export const APP_CONFIG = {
  APP_NAME: "AI 드림 다이어리",
  APP_SUBTITLE: "꿈 속 탐험가",
  APP_DESCRIPTION:
    "당신의 흩어진 꿈 조각을 모아, AI가 특별한 이야기로 만들어 드려요.",
  GITHUB_URL: "https://github.com/yourusername/ai-dream-diary",
  SUPPORT_EMAIL: "support@dreamdiary.com",
  VERSION: "1.0.0",

  // Limits
  MAX_DREAM_TEXT_LENGTH: 1000,
  MAX_KEYWORDS: 5,
  MAX_CHARACTERS: 3,
  MAX_OBJECTS: 3,

  // Pagination
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 50,

  // UI
  SIDEBAR_WIDTH: 280,
  HEADER_HEIGHT: 64,

  // Animation durations (ms)
  ANIMATION_FAST: 150,
  ANIMATION_NORMAL: 300,
  ANIMATION_SLOW: 500,
} as const;

export const TOAST_MESSAGES = {
  DREAM_GENERATED: "✨ 꿈 이야기가 생성되었습니다!",
  DREAM_SAVED: "💾 꿈이 저장되었습니다.",
  DREAM_DELETED: "🗑️ 꿈이 삭제되었습니다.",
  DREAM_FAVORITED: "⭐ 즐겨찾기에 추가되었습니다.",
  DREAM_UNFAVORITED: "⭐ 즐겨찾기에서 제거되었습니다.",
  PROFILE_UPDATED: "👤 프로필이 업데이트되었습니다.",
  SIGNIN_SUCCESS: "🎉 로그인되었습니다!",
  SIGNIN_ERROR: "😅 로그인에 실패했습니다.",
  SIGNOUT_SUCCESS: "👋 로그아웃되었습니다.",
  COPY_SUCCESS: "📋 클립보드에 복사되었습니다.",
  GENERATION_ERROR: "😔 이야기 생성에 실패했습니다. 다시 시도해주세요.",
  NETWORK_ERROR: "🌐 네트워크 오류가 발생했습니다.",
  UNKNOWN_ERROR: "❌ 알 수 없는 오류가 발생했습니다.",
} as const;

export const PLACEHOLDER_TEXTS = {
  DREAM_INPUT:
    "어젯밤 꿈에서 어떤 일이 일어났나요? 기억나는 장면이나 느낌을 자유롭게 적어보세요...\n\n예시:\n- 어두운 숲 속을 걷고 있었는데, 갑자기 빛나는 나비가 나타났어요\n- 하늘을 날고 있었는데 구름 위에서 친구를 만났어요\n- 옛날 살던 집에서 잃어버린 물건을 찾고 있었어요",
  SEARCH_DREAMS: "꿈 제목이나 내용으로 검색...",
  KEYWORDS: "예: 바다, 친구, 날기",
  CHARACTERS: "예: 친구, 가족, 낯선 사람",
  OBJECTS: "예: 자동차, 책, 열쇠",
} as const;

// Color palettes for UI theming
export const COLORS = {
  PRIMARY: "#8B5CF6",
  SECONDARY: "#06B6D4",
  SUCCESS: "#10B981",
  WARNING: "#F59E0B",
  ERROR: "#EF4444",

  GRADIENT_DREAM: "from-purple-400 via-pink-500 to-red-500",
  GRADIENT_NIGHT: "from-blue-900 via-purple-900 to-indigo-900",
  GRADIENT_DAWN: "from-pink-300 via-purple-300 to-indigo-400",

  TAG_COLORS: [
    "#8B5CF6",
    "#EC4899",
    "#06B6D4",
    "#10B981",
    "#F59E0B",
    "#EF4444",
    "#6B7280",
    "#8B5CF6",
  ],
} as const;

export const GENRE_OPTIONS = [
  // 일상 및 드라마 계열
  { value: "slice-of-life", label: "일상" },
  { value: "drama", label: "드라마" },
  { value: "coming-of-age", label: "성장" },

  // 판타지 및 초현실 계열
  { value: "fantasy", label: "판타지" },
  { value: "fairy-tale", label: "동화" },
  { value: "sci-fi", label: "SF (공상과학)" },

  // 긴장 및 공포 계열
  { value: "mystery", label: "미스터리" },
  { value: "thriller", label: "스릴러" },
  { value: "horror", label: "호러 (공포)" },

  // 기타 장르
  { value: "adventure", label: "모험" },
  { value: "romance", label: "로맨스" },
  { value: "comedy", label: "코미디" },
] as const;

export const MOOD_OPTIONS = [
  // 긍정적이고 밝은 분위기
  { value: "warm and heartwarming", label: "따뜻하고 마음이 편안해지는" },
  { value: "cheerful and lively", label: "발랄하고 경쾌한" }, // 사용자가 원했던 키워드
  { value: "hopeful and bright", label: "희망차고 밝은" },
  { value: "pleasant and comical", label: "유쾌하고 코믹한" },
  { value: "fluffy and heart-fluttering", label: "몽글몽글하고 설레는" },

  // 신비롭고 몽환적인 분위기
  { value: "mysterious and dreamlike", label: "신비롭고 몽환적인" },
  { value: "grand and epic", label: "장엄하고 서사적인" },
  { value: "calm and introspective", label: "차분하고 성찰적인" },

  // 부정적이고 어두운 분위기
  { value: "dark and gloomy", label: "어둡고 음산한" }, // 사용자가 원했던 키워드
  { value: "tense and suspenseful", label: "긴장감 넘치고 서스펜스 있는" },
  { value: "urgent and desperate", label: "긴박하고 절박한" },
  { value: "tragic and sorrowful", label: "비극적이고 애상적인" },
  { value: "bizarre and unsettling", label: "기괴하고 불쾌한" },
] as const;

export const EMOTION_OPTIONS = [
  // 긍정적 감정
  { emoji: "😊", value: "happy and fulfilled", label: "행복하고 충만한" },
  {
    emoji: "🥰",
    value: "heart-fluttering and excited",
    label: "설레고 두근거리는",
  },
  { emoji: "😌", value: "peaceful and stable", label: "평화롭고 안정적인" },
  { emoji: "🥳", value: "joyful and liberated", label: "기쁘고 해방되는" },

  // 부정적 감정
  {
    emoji: "😢",
    value: "sad and with a sense of loss",
    label: "슬프고 상실감 있는",
  },
  { emoji: "😨", value: "fearful and terrified", label: "두렵고 공포스러운" }, // 불안을 넘어선 공포
  { emoji: "😠", value: "angry and unfair", label: "분노와 억울함" },
  { emoji: "😥", value: "anxious and restless", label: "불안하고 초조한" }, // 기존 불안을 구체화

  // 복합적/기타 감정
  {
    emoji: "😮",
    value: "awestruck and overwhelmed",
    label: "경이롭고 압도되는",
  }, // 놀람을 긍정적으로
  {
    emoji: "🤯",
    value: "confused and bewildered",
    label: "혼란스럽고 어리둥절한",
  },
  { emoji: "🤔", value: "curious and questioning", label: "호기심과 의문" }, // 생각을 구체화
  { emoji: "😐", value: "empty and numb", label: "공허하고 무감각한" },
] as const;
