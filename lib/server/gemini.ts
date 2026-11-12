const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

/**
 * 사용 모델. 지원 종료 일정: https://ai.google.dev/gemini-api/docs/deprecations
 * - TEXT: 꿈 이야기·분석 리포트. 창작 품질 우선, thinking은 low로 지연·비용 억제.
 * - IMAGE: 1K 기준 장당 약 $0.034.
 */
export const GEMINI_MODELS = {
  TEXT: "gemini-3.8-flash",
  IMAGE: "gemini-nano-banana-2.1",
} as const;

export interface GeminiPart {
  text?: string;
  thought?: boolean;
  inlineData?: { mimeType: string; data: string };
}

export interface GeminiResponse {
  candidates?: { content?: { parts?: GeminiPart[] } }[];
  error?: { message?: string };
}

/** thinking 파트를 제외한 응답 텍스트를 이어 붙인다. */
export function getResponseText(data: GeminiResponse): string | undefined {
  const parts = data.candidates?.[0]?.content?.parts;
  if (!parts) return undefined;
  const text = parts
    .filter((part) => !part.thought && part.text)
    .map((part) => part.text)
    .join("");
  return text || undefined;
}

/** POSTs a generateContent request; the API key travels in a header, never the URL. */
export function callGemini(
  model: string,
  apiKey: string,
  body: Record<string, unknown>
): Promise<Response> {
  return fetch(`${GEMINI_BASE_URL}/${model}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify(body),
  });
}
