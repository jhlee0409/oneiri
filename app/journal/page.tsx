import DreamJournal from "../components/dream-journal"

// 샘플 꿈 일기 데이터 - 실제 앱에서는 API/데이터베이스에서 가져옴
const sampleDreamEntries = [
  {
    id: "1",
    title: "속삭이는 비밀의 마법 숲",
    date: "2024-01-15",
    preview:
      "달빛이 에메랄드 잎사귀 사이로 춤추는 고대 숲의 심장부에서, 당신은 별빛으로 만들어진 길을 따라 걷고 있었습니다...",
    originalDream: "숲 속에 있었는데 신비로운 누군가가 있었어요. 우리는 날거나 떠다니고 있었어요.",
    emotion: "😊",
    vibe: "신비로운",
    keywords: ["숲", "비행", "신비로운 낯선 사람"],
    hasImage: true,
  },
  {
    id: "2",
    title: "구름 위의 시계장치 도시",
    date: "2024-01-12",
    preview:
      "세상 높은 곳, 솜사탕 구름에 매달린 채로, 완전히 황동 기어와 수정 창문으로 만들어진 장엄한 도시가 서 있었습니다...",
    originalDream: "하늘에 떠 있는 놀라운 도시가 있었는데 기계 부품들이 많았고 정말 아름다웠어요.",
    emotion: "😮",
    vibe: "모험적인",
    keywords: ["도시", "구름", "기계", "비행"],
    hasImage: false,
  },
  {
    id: "3",
    title: "잃어버린 기억의 도서관",
    date: "2024-01-10",
    preview:
      "황혼 속에서 부드럽게 빛나는 책들로 가득한 끝없는 복도를 헤매고 있었습니다. 각각의 책은 누군가가 잊어버린 기억을 담고 있었습니다...",
    originalDream:
      "거대한 도서관에 있었는데 책들이 빛나고 있었어요. 뭔가 중요한 걸 찾고 있는 것 같았지만 뭔지 기억이 안 났어요.",
    emotion: "🤔",
    vibe: "신비로운",
    keywords: ["도서관", "책", "빛", "기억"],
    hasImage: true,
  },
  {
    id: "4",
    title: "별빛 나비와의 춤",
    date: "2024-01-08",
    preview:
      "다이아몬드처럼 반짝이는 풀이 있는 초원에서, 순수한 별빛으로 만들어진 수천 마리의 나비들이 우주적 발레를 추며 당신 주위를 맴돌았습니다...",
    originalDream: "아름답게 빛나는 나비들이 사방에 있었고 들판에서 그들과 함께 춤을 추고 있었어요.",
    emotion: "🥰",
    vibe: "따뜻한",
    keywords: ["나비", "춤", "별빛", "초원"],
    hasImage: false,
  },
  {
    id: "5",
    title: "바다 속 교향곡",
    date: "2024-01-05",
    preview:
      "수정처럼 맑은 바다의 파도 아래에서, 고래와 돌고래들이 당신이 들어본 것 중 가장 아름다운 음악을 연주하는 콘서트홀을 발견했습니다...",
    originalDream: "물 속에서 숨을 쉴 수 있었고 고래들이 가장 놀라운 노래를 부르고 있었어요. 정말 평화로웠어요.",
    emotion: "😴",
    vibe: "평화로운",
    keywords: ["바다 속", "고래", "음악", "바다"],
    hasImage: true,
  },
]

export default function JournalPage() {
  return <DreamJournal />
}
