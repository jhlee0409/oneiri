import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/server/supabase-admin";
import { getUserFromRequest } from "@/lib/server/auth";
import {
  callGemini,
  GEMINI_MODELS,
  getResponseText,
  type GeminiResponse,
} from "@/lib/server/gemini";

export const maxDuration = 60;

interface ReportData {
  keySymbols?: unknown;
  emotionalFlow?: unknown;
  freudianPerspective?: unknown;
  jungianPerspective?: unknown;
  oneiriSynthesis?: unknown;
}

function buildPrompt(storyContent: string): string {
  return `You are 'Oneiri', an AI Dream Analyst with a deep understanding of Freudian psychoanalysis and Jungian analytical psychology. Your persona is wise, gentle, and empathetic. Your goal is to analyze a dream narrative and create a multi-layered, insightful, and emotionally resonant report that encourages self-reflection. You must analyze ONLY the provided dream narrative text.

### Your Mission (Perform these steps sequentially):
1.  **Deep Analysis:** Deeply analyze the user's dream narrative to identify its core symbols, scenes, and emotional flow.
2.  **Dual Perspectives:** For each perspective (Freudian and Jungian), first briefly and conversationally introduce the core idea of that psychologist's dream theory in simple terms. Then, connect that idea to the user's dream to provide a gentle, insightful interpretation.
3.  **Archetype Card Assignment:** Based on the entire analysis, choose the single most fitting "Dream Archetype" from the provided list that represents the core theme of the dream.
4.  **Related Symbol Suggestion:** Identify 2-3 related but *different* dream symbols that are psychologically connected to the main themes. For each recommended symbol, formulate a brief, open-ended, and thought-provoking question.
5.  **Oneiri's Synthesis:** Synthesize all analyses into a concluding comment that gently poses a reflective question to the user, prompting them to look inward.
6.  **(New Task) Oneiri's Final Note:** After all analysis is complete, write a final, single-sentence, personal, and heartwarming closing comment. This note should feel like a warm, parting piece of wisdom from a caring analyst, offering encouragement or a beautiful, poetic thought related to the dream's theme.

### Provided Archetype List (for step 3):
- the_chase: The theme of avoidance, pressure, and self-discovery.
- the_flight: The theme of freedom, liberation, and new perspectives.
- the_fall: The theme of anxiety, loss of control, and letting go.
- the_discovery: The theme of realization, opportunity, and new beginnings.
- the_maze: The theme of confusion, choices, and inner exploration.
- the_growth: The theme of change, healing, and potential.
- the_loss: The theme of grief, separation, and acceptance.
- the_reunion: The theme of longing, connection, and reconciliation.
- the_mirror: The theme of self-reflection, truth, and inner self.
- the_ocean: The theme of the unconscious, deep emotions, and the unknown.
- the_tower: The theme of isolation, ambition, and higher perspective.
- the_gate: The theme of boundaries, transition, and new stages.

### Dream Narrative to Analyze:
"""
${storyContent}
"""

### CRITICAL: Output Language and Format
- The final output MUST be a single, valid JSON object.
- All string VALUES within the JSON object MUST be written in KOREAN. The keys must remain in English as specified below.
- You MUST strictly follow the JSON structure provided below.

{
  "keySymbols": [
    "첫 번째 핵심 상징 또는 장면",
    "두 번째 핵심 상징 또는 장면",
    "세 번째 핵심 상징 또는 장면"
  ],
  "emotionalFlow": "꿈 속에서 감정이 어떻게 변화했는지에 대한 한두 문장의 요약",
  "freudianPerspective": "프로이트의 핵심 이론을 쉽고 친근하게 한두 문장 소개한 뒤, 사용자의 꿈에 적용하여 해석한 내용",
  "jungianPerspective": "융의 핵심 이론을 쉽고 친근하게 한두 문장 소개한 뒤, 사용자의 꿈에 적용하여 해석한 내용",
  "archetypeCardKey": "선택된 원형의 key 값 (예: the_chase)",
  "relatedSymbols": [
    {
      "symbolName": "추천 상징 1 (예: 문)",
      "question": "추천 상징 1과 관련된, 성찰을 유도하는 질문"
    },
    {
      "symbolName": "추천 상징 2 (예: 열쇠)",
      "question": "추천 상징 2와 관련된, 성찰을 유도하는 질문"
    }
  ],
  "oneiriSynthesis": "모든 분석을 종합하여 사용자에게 성찰의 질문을 던지는 최종 코멘트",
  "oneiriNote": "사용자에게 건네는 따뜻하고 감성적인 마지막 한 줄 코멘트"
}`;
}

/** Strips a surrounding ```json ... ``` fence, as the original function did. */
function stripCodeFence(text: string): string {
  let result = text.trim();
  if (result.startsWith("```json")) result = result.substring(7);
  if (result.startsWith("```")) result = result.substring(3);
  if (result.endsWith("```")) result = result.substring(0, result.length - 3);
  return result.trim();
}

export async function POST(request: Request) {
  try {
    if (!request.headers.get("authorization")) {
      return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
    }
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: "사용자 인증에 실패했습니다." },
        { status: 401 }
      );
    }

    let requestBody: { storyContent?: unknown };
    try {
      requestBody = await request.json();
    } catch (parseError) {
      console.error("요청 본문 파싱 오류:", parseError);
      return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
    }

    const { storyContent } = requestBody;
    if (!storyContent || typeof storyContent !== "string") {
      return NextResponse.json({ error: "꿈 내용이 필요합니다." }, { status: 400 });
    }
    if (storyContent.trim().length < 10) {
      return NextResponse.json(
        { error: "꿈 내용을 좀 더 자세히 적어주세요." },
        { status: 400 }
      );
    }
    if (storyContent.trim().length > 2000) {
      return NextResponse.json(
        { error: "꿈 내용이 너무 깁니다. 2000자 이내로 작성해주세요." },
        { status: 400 }
      );
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      console.error("Gemini API 키 누락");
      return NextResponse.json(
        { error: "AI 서비스 설정이 완료되지 않았습니다." },
        { status: 500 }
      );
    }

    let rawText: string | undefined;
    try {
      const geminiResponse = await callGemini(GEMINI_MODELS.TEXT, geminiApiKey, {
        contents: [{ role: "user", parts: [{ text: buildPrompt(storyContent) }] }],
        generationConfig: {
          responseMimeType: "application/json",
          thinkingConfig: { thinkingLevel: "low" },
        },
      });
      if (!geminiResponse.ok) {
        throw new Error(
          `Gemini API ${geminiResponse.status}: ${await geminiResponse.text()}`
        );
      }
      const geminiData = (await geminiResponse.json()) as GeminiResponse;
      rawText = getResponseText(geminiData);
      if (rawText === undefined) throw new Error("Gemini 응답에 텍스트가 없습니다.");
    } catch (aiError) {
      console.error("Gemini API 호출 오류:", aiError);
      return NextResponse.json(
        { error: "AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요." },
        { status: 503 }
      );
    }

    const responseText = stripCodeFence(rawText);
    let reportData: ReportData;
    try {
      reportData = JSON.parse(responseText) as ReportData;
    } catch (parseError) {
      console.error("JSON 파싱 오류:", parseError, responseText.substring(0, 200));
      return NextResponse.json(
        { error: "AI 응답을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    if (
      !reportData.keySymbols ||
      !reportData.emotionalFlow ||
      !reportData.freudianPerspective ||
      !reportData.jungianPerspective ||
      !reportData.oneiriSynthesis
    ) {
      console.error("응답 데이터 구조 오류:", reportData);
      return NextResponse.json(
        { error: "AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요." },
        { status: 500 }
      );
    }

    const { data: insertData, error: insertError } = await createAdminClient()
      .from("analysis_reports")
      .insert({ user_id: user.id, input_text: storyContent, report_data: reportData })
      .select("id")
      .single();
    if (insertError) {
      console.error("DB 저장 오류:", insertError);
      return NextResponse.json(
        { error: "분석 결과를 저장하는 중 오류가 발생했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({ reportId: insertData.id });
  } catch (error) {
    console.error("꿈 분석 오류:", error);
    return NextResponse.json(
      { error: "분석 중 예상치 못한 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
