import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'jsr:@supabase/supabase-js@2';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, OPTIONS'
};
Deno.serve(async (req)=>{
  console.log('📈 일일 꿈 생성 상태 조회 요청:', new Date().toISOString());
  // CORS preflight 처리
  if (req.method === 'OPTIONS') {
    console.log('📋 CORS preflight 요청 처리');
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Supabase 클라이언트 초기화
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Supabase 환경 변수가 설정되지 않았습니다');
      return new Response(JSON.stringify({
        success: false,
        error: '서버 설정 오류입니다',
        oneiri_message: '별빛 서재의 설정에 문제가 있어요. 잠시 후 다시 시도해주세요. 🌟'
      }), {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const supabase = createClient(supabaseUrl, supabaseKey);
    // 사용자 인증 확인
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ Authorization 헤더가 없습니다');
      return new Response(JSON.stringify({
        success: false,
        error: '인증이 필요합니다',
        oneiri_message: '별빛 서재에 입장하려면 먼저 인증이 필요해요. 🌟'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      console.error('❌ 사용자 인증 실패:', authError?.message);
      return new Response(JSON.stringify({
        success: false,
        error: '유효하지 않은 인증 토큰입니다',
        oneiri_message: '별빛이 흐려져 서재에 들어갈 수 없어요. 다시 시도해주세요. ✨'
      }), {
        status: 401,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    console.log('✅ 사용자 인증 성공:', user.id);
    // KST 날짜 계산 (UTC+9)
    const now = new Date();
    const kstOffset = 9 * 60; // 9시간을 분으로 변환
    const kstTime = new Date(now.getTime() + kstOffset * 60 * 1000);
    const kstDateString = kstTime.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    console.log(`🕘 현재 시간 (UTC): ${now.toISOString()}`);
    console.log(`🕘 현재 시간 (KST): ${kstTime.toISOString()}`);
    console.log(`📅 KST 날짜: ${kstDateString}`);
    // 일별 생성 횟수 조회
    const { data: countData, error: countError } = await supabase.from('daily_weaving_counts').select('count').eq('user_id', user.id).eq('weaving_date', kstDateString).single();
    let currentCount = 0;
    if (countData) {
      currentCount = countData.count;
      console.log(`📊 현재 생성 횟수: ${currentCount}`);
    } else {
      console.log('📊 오늘 아직 생성하지 않음');
    }
    const DAILY_LIMIT = 2;
    const remaining = Math.max(0, DAILY_LIMIT - currentCount);
    const canCreate = currentCount < DAILY_LIMIT;
    const hasReachedLimit = currentCount >= DAILY_LIMIT;
    console.log(`📊 상태: ${currentCount}/${DAILY_LIMIT}, 남은 횟수: ${remaining}, 생성 가능: ${canCreate}`);
    // 오늘 생성된 꿈들 가져오기
    const { data: todayDreams, error: dreamsError } = await supabase.from('dreams').select('id, generated_story_title, created_at').eq('user_id', user.id).gte('created_at', `${kstDateString}T00:00:00+09:00`).lt('created_at', `${kstDateString}T23:59:59+09:00`).order('created_at', {
      ascending: false
    });
    if (dreamsError) {
      console.error('❌ 오늘 꿈 조회 실패:', dreamsError);
    } else {
      console.log(`📚 오늘 생성된 꿈: ${todayDreams?.length || 0}개`);
    }
    // 다음 리셋 시간 계산 (내일 자정)
    const tomorrow = new Date(kstTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const nextReset = tomorrow.toISOString();
    // 리셋까지 남은 시간
    const hoursUntilReset = Math.ceil((tomorrow.getTime() - kstTime.getTime()) / (1000 * 60 * 60));
    // Oneiri 메시지 생성
    let oneiriMessage;
    if (hasReachedLimit) {
      oneiriMessage = {
        title: "오늘의 꿈들은 모두 완성되었어요",
        content: `오늘은 이미 ${DAILY_LIMIT}편의 아름다운 꿈을 만들었어요. 별빛이 내일 다시 충전될 때까지 기다려주세요.`,
        hours_until_reset: hoursUntilReset
      };
    } else if (currentCount === 0) {
      oneiriMessage = {
        title: "오늘의 꿈 이야기를 기다리고 있어요",
        content: `오늘은 아직 꿈을 만들지 않았어요. ${DAILY_LIMIT}편의 아름다운 이야기를 만들 수 있어요!`,
        encouragement: "가장 사소한 꿈의 조각이 가장 특별한 이야기가 되기도 해요. ✨"
      };
    } else {
      oneiriMessage = {
        title: "더 많은 꿈을 만들 수 있어요",
        content: `오늘 ${remaining}편의 꿈을 더 만들 수 있어요. 별빛이 당신의 이야기를 기다리고 있어요!`,
        encouragement: "각 꿈의 조각이 별빛으로 변해가는 과정을 지켜보세요. ✨🌟"
      };
    }
    // 다음 액션 결정
    let nextAction;
    if (hasReachedLimit) {
      nextAction = "visit_library";
    } else if (remaining === 1) {
      nextAction = "create_final_dream";
    } else {
      nextAction = "create_dream";
    }
    // 전체 꿈 개수 조회
    const { count: totalDreams } = await supabase.from('dreams').select('*', {
      count: 'exact',
      head: true
    }).eq('user_id', user.id);
    console.log(`📊 전체 꿈 개수: ${totalDreams || 0}`);
    // 프론트엔드가 기대하는 구조로 응답
    const responseData = {
      weaving_status: {
        current_count: currentCount,
        daily_limit: DAILY_LIMIT,
        remaining: remaining,
        has_reached_limit: hasReachedLimit,
        next_reset: nextReset,
        hours_until_reset: hoursUntilReset
      },
      oneiri_message: oneiriMessage,
      todays_dreams: (todayDreams || []).map((dream)=>({
          id: dream.id,
          title: dream.generated_story_title || '제목 없음',
          created_at: dream.created_at
        })),
      total_dreams: totalDreams || 0,
      next_action: nextAction
    };
    console.log('✅ 일일 꿈 생성 상태 조회 완료');
    // 성공 응답
    return new Response(JSON.stringify({
      success: true,
      data: responseData
    }), {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('❌ 예상치 못한 오류:', error);
    return new Response(JSON.stringify({
      success: false,
      error: '서버 내부 오류가 발생했습니다',
      oneiri_message: '별빛 마법에 예상치 못한 문제가 생겼어요. 잠시 후 다시 시도해주세요. 🌟'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
