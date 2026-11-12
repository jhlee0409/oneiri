import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS"
};
// 📌 [개선됨] 안전한 JSON 파싱 유틸리티
function safeParseJSON(text) {
  // 1단계: 기본 정제
  let cleanText = text.trim().replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // 제어 문자 완전 제거
  .replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
  // 2단계: JSON 블록 추출
  const jsonMatch = cleanText.match(/```json\s*([\s\S]*?)\s*```/);
  if (jsonMatch) {
    cleanText = jsonMatch[1].trim();
  } else if (cleanText.includes('{') && cleanText.includes('}')) {
    const start = cleanText.indexOf('{');
    const end = cleanText.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
      cleanText = cleanText.substring(start, end + 1);
    }
  }
  // 3단계: 최종 정제
  cleanText = cleanText.replace(/,(\s*[}\]])/g, '$1') // 마지막 쉼표 제거
  .replace(/([^\\])\\(?!["\\/bfnrt])/g, '$1\\\\'); // 잘못된 이스케이프 수정
  return JSON.parse(cleanText);
}
Deno.serve(async (req)=>{
  console.log("🌙 꿈 직조 요청 시작:", new Date().toISOString());
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!supabaseUrl || !supabaseKey || !geminiApiKey) {
      throw new Error("필수 환경 변수가 설정되지 않았습니다.");
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    // 인증 확인
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({
        error: "인증이 필요합니다",
        oneiri_message: "별빛 서재에 입장하려면 먼저 인증이 필요해요. 🌟"
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({
        error: "유효하지 않은 인증 토큰입니다",
        oneiri_message: "별빛이 흐려져 서재에 들어갈 수 없어요. 다시 시도해주세요. ✨"
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // 요청 데이터 파싱
    const rawData = await req.json();
    const dreamInputText = rawData.dreamInputText || rawData.dream_input_text;
    if (!dreamInputText || dreamInputText.trim().length < 5) {
      return new Response(JSON.stringify({
        error: "꿈 내용을 5글자 이상 입력해주세요",
        oneiri_message: "꿈의 이야기를 조금 더 자세히 들려주세요. 🌟"
      }), {
        status: 400,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    const requestData = {
      dreamInputText: dreamInputText.trim(),
      dreamKeywords: rawData.dreamKeywords || rawData.dream_keywords,
      dreamEmotion: rawData.dreamEmotion || rawData.dream_emotion,
      storyPreferenceGenre: rawData.storyPreferenceGenre || rawData.story_preference_genre,
      storyPreferenceLength: rawData.storyPreferenceLength || rawData.story_preference_length,
      storyPreferenceMood: rawData.storyPreferenceMood || rawData.story_preference_mood,
      dreamCharacters: rawData.dreamCharacters || rawData.dream_characters,
      dreamObjects: rawData.dreamObjects || rawData.dream_objects
    };
    // 일일 제한 확인
    const now = new Date();
    const kstOffset = 9 * 60 * 60 * 1000;
    const kstTime = new Date(now.getTime() + kstOffset);
    const kstDateString = kstTime.toISOString().split("T")[0];
    // 📌 [수정됨] maybeSingle()을 사용하여 안전한 조회
    const { data: countData, error: countError } = await supabase.from("daily_weaving_counts").select("count").eq("user_id", user.id).eq("weaving_date", kstDateString).maybeSingle();
    // 에러가 발생한 경우에만 처리
    if (countError) {
      console.error("❌ 일일 생성 횟수 조회 실패:", countError);
      throw new Error("일일 생성 횟수 조회 중 오류가 발생했습니다.");
    }
    const currentCount = countData?.count || 0;
    const DAILY_LIMIT = 2;
    if (currentCount >= DAILY_LIMIT) {
      const { data: todayDreams } = await supabase.from("dreams").select("id, generated_story_title, created_at").eq("user_id", user.id).gte("created_at", `${kstDateString}T00:00:00+09:00`).lt("created_at", `${kstDateString}T23:59:59+09:00`);
      return new Response(JSON.stringify({
        error: "일일 생성 한도를 초과했습니다",
        limit_reached: true,
        current_count: currentCount,
        daily_limit: DAILY_LIMIT,
        today_dreams: todayDreams || [],
        oneiri_message: `오늘은 이미 ${DAILY_LIMIT}편의 꿈을 직조하셨어요. 별빛이 내일 다시 충전될 때까지 기다려주세요. 🌟✨`
      }), {
        status: 429,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // ✅ [개선됨] 모든 데이터를 활용하는 지능적인 프롬프트 생성기
    const generateImagePrompt_v2 = ({ coreScene, mood, emotion, characters, objects, keywords })=>{
      // 1. 기본 스타일과 시점 설정
      let prompt = `A cinematic, atmospheric photo capturing a surreal dream from a first-person perspective. The main scene is: "${coreScene.replace(/["']/g, "")}".`;
      // 2. 핵심 등장인물 및 사물 추가 (데이터가 있을 경우에만)
      if (characters && characters.trim()) {
        prompt += ` A key figure, described as '${characters}', is central to the scene.`;
      }
      if (objects && objects.trim()) {
        prompt += ` A significant object, '${objects}', is prominently featured, glowing with a soft, inner light.`;
      }
      // 3. 분위기와 감정을 시각적 언어로 번역
      prompt += ` The overall atmosphere is intensely ${mood} and charged with a deep feeling of '${emotion}'. This is visually expressed through dramatic lighting, a color palette dominated by deep teals and warm golds, and an ethereal, dreamlike quality with soft focus and swirling mist.`;
      // 4. 핵심 키워드를 통해 디테일 강화 (데이터가 있을 경우에만)
      if (keywords && keywords.length > 0) {
        prompt += ` Key visual motifs include: ${keywords.join(", ")}.`;
      }
      // 5. 최종 퀄리티를 위한 스타일 키워드 추가
      prompt += ` Hyper-detailed, epic composition, cinematic lighting. No visible text, captions, or signage.`;
      return prompt;
    };
    // 📌 [단순화됨] 간소한 프롬프트
    const prompt = `
You are a professional Korean storyteller and dream interpreter.  
Your sacred task is to **weave a vivid, emotional story** based solely on the user’s dream memory.  
Every detail must serve this exact memory. No unrelated elements.

---

### 📍[Step 1: The Core Dream Moment]

- Core scene: "${requestData.dreamInputText.trim().replace(/\s+/g, ' ')}"
- This is the most important part of the entire story.
- Describe this scene **visually**, **sensorially**, and **emotionally**.  
- All story beats must **lead up to and revolve around this moment**.

---

### 🧩[Step 2: Supporting Context & Rules]

Use only when it enhances the core moment.

- Genre: "${requestData.storyPreferenceGenre || "현실과 상상이 혼합된 자유 형식"}"
- Mood: "${requestData.storyPreferenceMood || "중립적이고 자연스러운 분위기"}"
- Emotion: "${requestData.dreamEmotion || "구체화되지 않은 감정"}"
- Keywords: \`${requestData.dreamKeywords?.join(", ") || "묘사할 특별한 키워드 없음"}\`
- Characters: \`${requestData.dreamCharacters || ""}\`
- Objects: \`${requestData.dreamObjects || ""}\`

Do NOT add new characters or events. Do NOT deviate from the provided input.

---

### 🧱[Step 3: Style & Output Rules]

- Story must be 3~4 short paragraphs.
- Use 1st person ("나") only.
- Do not describe waking up.
- End with a **symbolic image**, **lingering emotion**, or **ambiguous impression**.
- Avoid cliché. No moral lessons. No over-explanation.

---

### 📦[Final Output Format – Korean only except image_prompt]

Respond ONLY with the following strict JSON format.

DO NOT include markdown, explanations, or any extra text.
DO NOT wrap with \`\`\`json or other syntax.

{
  "story_title": "...",
  "story_content": "...",
  "image_prompt": ${JSON.stringify(generateImagePrompt_v2({
      coreScene: requestData.dreamInputText,
      mood: requestData.storyPreferenceMood || "mysterious",
      emotion: requestData.dreamEmotion || "awe",
      characters: requestData.dreamCharacters,
      objects: requestData.dreamObjects,
      keywords: requestData.dreamKeywords
    }))}
}
`;
    console.log("🤖 Gemini API 호출 시작");
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.9,
          maxOutputTokens: 2048
        }
      })
    });
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      throw new Error(`Gemini API 오류 (${geminiResponse.status}): ${errorText}`);
    }
    const geminiData = await geminiResponse.json();
    console.log("✅ Gemini 응답 수신 완료");
    // 📌 [개선됨] 안전한 응답 처리
    const candidate = geminiData.candidates?.[0];
    if (!candidate?.content?.parts?.[0]?.text) {
      console.error("❌ Gemini 응답 없음:", geminiData);
      throw new Error("AI 응답을 받을 수 없습니다.");
    }
    const responseText = candidate.content.parts[0].text;
    console.log("📝 Gemini 응답 길이:", responseText.length);
    // JSON 파싱
    let generatedContent;
    try {
      generatedContent = safeParseJSON(responseText);
      console.log("✅ JSON 파싱 성공");
    } catch (parseError) {
      console.error("❌ JSON 파싱 실패:", parseError.message);
      console.error("🔍 원본 응답 (첫 500자):", responseText.substring(0, 500));
      // 📌 [추가됨] 파싱 실패 시 대안 처리
      return new Response(JSON.stringify({
        error: "AI 응답 처리 중 오류가 발생했습니다",
        oneiri_message: "꿈의 실이 엉켜버렸어요. 다시 한번 시도해주세요. 🧶✨",
        debug_info: {
          error_message: parseError.message,
          response_preview: responseText.substring(0, 200),
          response_length: responseText.length
        }
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        }
      });
    }
    // 필수 필드 검증
    if (!generatedContent?.story_title || !generatedContent?.story_content) {
      throw new Error("생성된 내용이 불완전합니다.");
    }
    // 📌 카운트 업데이트 (성공 시에만)
    const newCount = currentCount + 1;
    await supabase.from("daily_weaving_counts").upsert({
      user_id: user.id,
      weaving_date: kstDateString,
      count: newCount
    }, {
      onConflict: "user_id, weaving_date"
    });
    // 꿈 데이터 저장
    const dreamData = {
      user_id: user.id,
      dream_input_text: requestData.dreamInputText,
      dream_keywords: requestData.dreamKeywords,
      dream_emotion: requestData.dreamEmotion,
      story_preference_genre: requestData.storyPreferenceGenre,
      story_preference_length: requestData.storyPreferenceLength,
      story_preference_mood: requestData.storyPreferenceMood,
      generated_story_title: generatedContent.story_title,
      generated_story_content: generatedContent.story_content,
      generated_image_prompt: generatedContent.image_prompt || "",
      processing_status: "completed",
      generated_at: new Date().toISOString(),
      raw_gemini_response: geminiData
    };
    const { data: insertedDream, error: insertError } = await supabase.from("dreams").insert(dreamData).select().single();
    if (insertError) {
      console.error("❌ 꿈 저장 실패:", insertError);
      throw new Error("이야기 저장 중 오류가 발생했습니다.");
    }
    console.log("✅ 꿈 직조 완료:", insertedDream.id);
    return new Response(JSON.stringify({
      success: true,
      dream: insertedDream,
      daily_status: {
        current_count: newCount,
        daily_limit: DAILY_LIMIT,
        remaining: DAILY_LIMIT - newCount
      },
      oneiri_message: `새로운 꿈이 별빛으로 직조되었어요! 오늘 ${DAILY_LIMIT - newCount}편 더 만들 수 있어요. ✨🌙`
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("❌ 예상치 못한 오류:", error);
    return new Response(JSON.stringify({
      error: error.message,
      oneiri_message: "별빛 마법에 예상치 못한 문제가 생겼어요. 잠시 후 다시 시도해주세요. 🌟"
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  }
});
