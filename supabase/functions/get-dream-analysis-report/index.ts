import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { GoogleGenerativeAI } from "npm:@google/generative-ai";
import { createClient } from "jsr:@supabase/supabase-js@2";
Deno.serve(async (req)=>{
  // CORS 처리
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }
  console.log('🧠 꿈 분석 요청 시작');
  try {
    // 요청 본문 파싱
    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      console.error('요청 본문 파싱 오류:', parseError);
      return new Response(JSON.stringify({
        error: '잘못된 요청 형식입니다.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    const { storyContent } = requestBody;
    if (!storyContent || typeof storyContent !== 'string') {
      console.error('꿈 내용 누락 또는 잘못된 타입:', typeof storyContent);
      return new Response(JSON.stringify({
        error: '꿈 내용이 필요합니다.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    if (storyContent.trim().length < 10) {
      return new Response(JSON.stringify({
        error: '꿈 내용을 좀 더 자세히 적어주세요.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    if (storyContent.trim().length > 2000) {
      return new Response(JSON.stringify({
        error: '꿈 내용이 너무 깁니다. 2000자 이내로 작성해주세요.'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    console.log('꿈 내용 길이:', storyContent.length, '글자');
    // 사용자 인증 확인
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('인증 헤더 누락');
      return new Response(JSON.stringify({
        error: '인증이 필요합니다.'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    // Supabase 클라이언트 생성
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase 환경 변수 누락');
      return new Response(JSON.stringify({
        error: '서버 설정 오류입니다.'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });
    // 사용자 정보 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) {
      console.error('사용자 인증 오류:', userError);
      return new Response(JSON.stringify({
        error: '사용자 인증에 실패했습니다.'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    if (!user) {
      console.error('사용자 정보 없음');
      return new Response(JSON.stringify({
        error: '로그인이 필요합니다.'
      }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    console.log('✅ 사용자 인증 완료:', user.id);
    // Gemini API 키 확인
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.error('Gemini API 키 누락');
      return new Response(JSON.stringify({
        error: 'AI 서비스 설정이 완료되지 않았습니다.'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    // AI 프롬프트 구성
    const prompt = `You are 'Oneiri', an AI Dream Analyst with a deep understanding of Freudian psychoanalysis and Jungian analytical psychology. Your persona is wise, gentle, and empathetic. Your goal is to analyze a dream narrative and create a multi-layered, insightful, and emotionally resonant report that encourages self-reflection. You must analyze ONLY the provided dream narrative text.

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
    console.log('🤖 Gemini API 호출 시작');
    // Gemini API 호출
    const genAI = new GoogleGenerativeAI(geminiApiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash"
    });
    let result;
    try {
      result = await model.generateContent(prompt);
    } catch (aiError) {
      console.error('Gemini API 호출 오류:', aiError);
      return new Response(JSON.stringify({
        error: 'AI 서비스에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.'
      }), {
        status: 503,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    let responseText = result.response.text();
    console.log('원본 AI 응답 길이:', responseText.length);
    // 마크다운 코드 블록 제거 (처리 강화)
    responseText = responseText.trim();
    // ```json으로 시작하고 ```로 끝나는 마크다운 코드 블록 제거
    if (responseText.startsWith('```json')) {
      responseText = responseText.substring(7); // '```json' 제거
    }
    if (responseText.startsWith('```')) {
      responseText = responseText.substring(3); // '```' 제거
    }
    if (responseText.endsWith('```')) {
      responseText = responseText.substring(0, responseText.length - 3); // '```' 제거
    }
    // 앞뒤 공백 다시 제거
    responseText = responseText.trim();
    console.log('정리된 AI 응답 길이:', responseText.length);
    // JSON 파싱 시도
    let reportData;
    try {
      reportData = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON 파싱 오류:', parseError);
      console.error('원본 응답 미리보기:', result.response.text().substring(0, 200));
      console.error('정리된 응답 미리보기:', responseText.substring(0, 200));
      return new Response(JSON.stringify({
        error: 'AI 응답을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    // 응답 데이터 유효성 검사
    if (!reportData.keySymbols || !reportData.emotionalFlow || !reportData.freudianPerspective || !reportData.jungianPerspective || !reportData.oneiriSynthesis) {
      console.error('응답 데이터 구조 오류:', reportData);
      return new Response(JSON.stringify({
        error: 'AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    console.log('✅ AI 분석 완료');
    // DB에 저장
    console.log('💾 데이터베이스 저장 시작');
    const { data: insertData, error: insertError } = await supabase.from('analysis_reports').insert({
      user_id: user.id,
      input_text: storyContent,
      report_data: reportData
    }).select('id').single();
    if (insertError) {
      console.error('DB 저장 오류:', insertError);
      return new Response(JSON.stringify({
        error: '분석 결과를 저장하는 중 오류가 발생했습니다.'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    console.log('✅ 데이터베이스 저장 완료, 리포트 ID:', insertData.id);
    // 성공 응답
    return new Response(JSON.stringify({
      reportId: insertData.id
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('🚨 전체 오류:', error);
    return new Response(JSON.stringify({
      error: '분석 중 예상치 못한 오류가 발생했습니다.'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});
