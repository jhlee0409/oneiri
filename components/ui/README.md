# ImageWithFallback 컴포넌트

기존 Next.js Image 컴포넌트에 자동 에러 핸들링과 fallback 기능을 추가한 컴포넌트입니다.

## 주요 기능

- 🛠️ **자동 에러 핸들링**: 이미지 로드 실패 시 자동으로 fallback UI 표시
- 🔄 **Fallback 이미지**: 대체 이미지 URL 지원
- 🎨 **커스텀 메시지**: 커스터마이징 가능한 에러 메시지
- ⚡ **성능 최적화**: blur placeholder 기본 지원
- 🎯 **유연한 에러 처리**: 커스텀 onError 핸들러 지원
- 📦 **Next.js Image 호환**: 기존 Image props 모두 지원

## 사용법

### 기본 사용

```tsx
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

<ImageWithFallback
  src="/my-image.jpg"
  alt="이미지 설명"
  width={300}
  height={200}
  fallbackMessage="이미지를 불러올 수 없습니다"
/>;
```

### Fallback 이미지 사용

```tsx
<ImageWithFallback
  src="/primary-image.jpg"
  alt="이미지 설명"
  width={300}
  height={200}
  fallbackSrc="/fallback-image.jpg"
  fallbackMessage="대체 이미지"
/>
```

### 커스텀 onError 핸들러

```tsx
<ImageWithFallback
  src="/my-image.jpg"
  alt="이미지 설명"
  width={300}
  height={200}
  fallbackMessage="이미지 로드 실패"
  onError={(e) => {
    console.error("이미지 로드 실패:", e);
    // 추가적인 에러 처리 로직
  }}
/>
```

### fill prop과 함께 사용

```tsx
<div className="relative w-full h-64">
  <ImageWithFallback
    src="/my-image.jpg"
    alt="이미지 설명"
    fill
    className="object-cover"
    fallbackMessage="이미지를 불러올 수 없습니다"
  />
</div>
```

## Props

| Prop                  | Type       | Default                       | 설명                                       |
| --------------------- | ---------- | ----------------------------- | ------------------------------------------ |
| `fallbackSrc`         | `string`   | -                             | 메인 이미지 실패 시 사용할 대체 이미지 URL |
| `fallbackMessage`     | `string`   | "이미지를 불러올 수 없습니다" | 에러 시 표시할 메시지                      |
| `containerClassName`  | `string`   | -                             | 컨테이너 div에 적용할 CSS 클래스           |
| `showBlurPlaceholder` | `boolean`  | `true`                        | blur placeholder 사용 여부                 |
| `blurDataURL`         | `string`   | 기본 blur 이미지              | 커스텀 blur placeholder                    |
| `onError`             | `function` | -                             | 커스텀 에러 핸들러                         |

- Next.js Image 컴포넌트의 모든 props 지원

## 에러 처리 플로우

1. **메인 이미지 로드 시도**
2. **실패 시 fallbackSrc가 있으면 대체 이미지 로드**
3. **대체 이미지도 실패하거나 없으면 fallbackMessage 표시**
4. **각 단계에서 onError 핸들러 실행 (있는 경우)**

## 마이그레이션 가이드

기존 Next.js Image를 ImageWithFallback으로 교체:

```tsx
// Before
import Image from "next/image";

<Image
  src="/image.jpg"
  alt="설명"
  width={300}
  height={200}
  onError={() => console.log("에러")}
/>;

// After
import { ImageWithFallback } from "@/components/ui/image-with-fallback";

<ImageWithFallback
  src="/image.jpg"
  alt="설명"
  width={300}
  height={200}
  fallbackMessage="이미지 로드 실패"
  onError={() => console.log("에러")}
/>;
```

## 스타일링

컨테이너와 이미지에 각각 다른 스타일을 적용할 수 있습니다:

```tsx
<ImageWithFallback
  src="/image.jpg"
  alt="설명"
  width={300}
  height={200}
  className="rounded-lg shadow-md" // 이미지에 적용
  containerClassName="border-2 border-gray-300" // 컨테이너에 적용
/>
```
