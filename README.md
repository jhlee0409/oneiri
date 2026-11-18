# Oneiri: AI가 엮어주는 당신의 꿈 이야기 🌙

**Oneiri**는 잠자는 동안 흩어진 꿈 조각들을 모아, 최신 AI가 한 편의 아름다운 이야기와 신비로운 이미지로 엮어주는 특별한 공간입니다. 복잡한 현실에서 잠시 벗어나, 당신의 무의식이 속삭이는 세계를 눈과 마음으로 동시에 탐험해보세요.

## ✨ 주요 기능

- **꿈 조각 기록:** 오늘 밤 당신의 꿈 속에서 가장 인상 깊었던 장면, 감정, 또는 이미지를 짧은 글로 기록해보세요.
- **AI 꿈 이야기 직조:** Oneiri의 AI Dream Weaver가 당신의 꿈 조각을 바탕으로 독창적이고 매혹적인 이야기를 만들어 드립니다.
- **꿈 풍경 감상 (Preview):** AI가 꿈 이야기에서 영감을 받아 그린, 세상에 단 하나뿐인 꿈의 풍경 이미지를 감상하며 더욱 깊은 몰입감을 느껴보세요.
- **꿈 서재:** Oneiri가 엮어준 꿈 이야기와 이미지를 소중하게 보관하고 언제든 다시 펼쳐보세요.
- **(향후 기능) 꿈 패턴 발견:** Oneiri가 당신의 꿈 속에 자주 등장하는 상징과 감정을 분석하여 숨겨진 의미를 찾아드립니다.

## 💫 Oneiri는 이런 분들께 추천합니다

- 꿈을 자주 꾸고 그 의미가 궁금하신 분
- 일상에 지쳐 새로운 영감과 위로가 필요하신 분
- 잠재된 창의력을 깨우고 싶으신 분
- 단순한 일기 이상의 시각적이고 특별한 기록 경험을 원하시는 분

## 🛠️ 기술 스택 (Tech Stack)

- **프론트엔드 (Frontend):** Next.js, Tailwind CSS, React
- **백엔드 & 데이터베이스 (Backend & DB):** Next.js Route Handlers (Vercel), Supabase (PostgreSQL, Auth, Storage)
- **AI 모델 (AI Model):**
  - **텍스트 생성 (Text Generation):** **`Gemini 3.8 Flash`**
  - **이미지 생성 (Image Generation):** **`Nano Banana 2.1`**

> **Note:** Oneiri는 Google의 최신 AI 기술을 적극적으로 활용하여, 텍스트와 이미지를 동시에 효율적으로 생성하는 차세대 모델을 기반으로 구축되었습니다. 이를 통해 빠르고 비용 효율적이면서도 풍부한 멀티모달 경험을 제공합니다.

## 개발기

1. 각각 역할의 프롬프트는 GPT 4.5를 이용헀습니다.
2. 기획과 브랜딩의 경우 Gemini 2.5 Pro를 이용하여 진행했습니다.
3. 디자인은 v0를 통해 진행했습니다.
4. 개발의 경우 Cursor / Clade 4.0 Sonnet 을 이용해서 진행했습니다.
   1. 백엔드의 경우 Supabase MCP를 이용해서 기획을 바탕으로 한 테이블 구조 설계 및 edge function을 활용한 기능을 구현했습니다.
   2. 프론트의 경우 기능 검수 정도만 진행했습니다. (추후 리팩토링 및 구조 개선 실시 예정)

## 🚀 시작하기

1. **[Oneiri](https://www.oneiri.app)** 에 방문합니다.
2. Google 계정으로 간편하게 가입하고 로그인합니다.
3. "오늘의 꿈 조각 건네주기 ✨" 버튼을 클릭하여 꿈 이야기를 시작해보세요.

## 꿈 페이지 수요 검증

- 본인 꿈 상세에서 「꿈 페이지」(꿈 한 편을 그림과 글로 엮은 A5 인쇄용 파일) 견본과 3,900원 예상 가격을 확인할 수 있습니다. 관심 신청만 기록하며 결제나 메일은 보내지 않습니다. 여러 페이지를 한 권으로 엮는 「꿈 책」은 이후 단계입니다.
- GA4에서 `/dreams/new` 방문 → `dream_input_started` (게스트) → `guest_dream_created` → `guest_dream_claimed`를 봅니다. 꿈 본문이나 이메일을 GA4로 보내지 않습니다.
- Supabase 마이그레이션을 앱보다 먼저 적용합니다. 체험 한도는 한국 시간 기준 IP당 하루 1건·전체 하루 300건이며, 모델을 호출하기 전에 차감됩니다. 실패한 시도도 비용 보호를 위해 복구하지 않습니다.
- `story_generation_metrics`는 모델 호출별 결과·응답 시간·사용 토큰을 기록합니다. `estimated_cost_nano_usd`는 공개 단가 추정치이며, 토큰 정보가 없으면 `NULL`입니다. 실제 청구액과는 구분합니다.
- `dream_postcard_interest`의 `page-3900-v1` 집계는 계정당 한 번만 셉니다. 50명 중 5명 이상이 신청하면 수작업 판매 검증으로 넘어갑니다. (`postcard-3900-v1`은 엽서 컨셉 시절 버전으로 노출 0건에서 종료)

```sql
select count(*) as price_views,
       count(signed_up_at) as signups
from public.dream_postcard_interest
where offer_version = 'page-3900-v1';
```

```sql
select audience,
       count(*) as attempts,
       count(*) filter (where outcome = 'generated') as generated,
       count(*) filter (where estimated_cost_nano_usd is null) as unknown_cost,
       sum(estimated_cost_nano_usd)::numeric / 1000000000
         / nullif(count(*) filter (where outcome = 'generated'), 0) as estimated_usd_per_generated,
       round(avg(elapsed_ms)) as average_ms
from public.story_generation_metrics
where created_at >= now() - interval '7 days'
group by audience;
```

## 🎨 디자인 컨셉

- Oneiri는 **"평온하고 천상의 미학 (Serene and ethereal aesthetic)"**을 추구합니다. 더스티 라벤더, 페일 스카이 블루, 따뜻한 오프화이트 등 부드러운 색감과 섬세한 그라데이션, 둥근 모서리를 사용하여 편안하고 꿈결 같은 분위기를 연출합니다.
- v0를 활용하여 기본적인 디자인을 구축했습니다.

### 📝 개발 여정

Oneiri는 사이드 프로젝트로 시작되었지만, 꿈과 AI에 대한 열정으로 끊임없이 발전하고 있습니다. 앞으로 더욱 다양한 기능과 아름다운 디자인으로 여러분의 꿈을 더욱 풍요롭게 만들어갈 예정입니다.

## 🔗 링크

- [웹사이트](https://www.oneiri.app)
- [GitHub 저장소](https://github.com/jhlee0409/oneiri)

---

**주요 변경 사항:**

1. **주요 기능 섹션:** "꿈 풍경 감상"을 **(Preview)** 태그와 함께 주요 기능으로 상향 조정하여, 이미지 생성 기능이 핵심임을 명확히 했습니다.
2. **기술 스택 섹션:**
   - AI 모델 부분을 **텍스트 생성**과 **이미지 생성**으로 나누어 구체적으로 명시했습니다.
   - 가상의 모델명 **`Gemini 2.0 Flash`** 와 **`Gemini 2.0 Flash (Preview Image Generation)`** 을 사용하여 최신 기술을 활용하고 있음을 강조했습니다.
   - 인용 블록(`> Note:`)을 추가하여 이 기술 선택이 어떤 의미를 갖는지(빠르고, 비용 효율적, 멀티모달 경험) 부연 설명했습니다.
