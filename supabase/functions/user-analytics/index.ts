import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
Deno.serve(async (req)=>{
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS'
  };
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({
      success: false,
      error: 'Method not allowed'
    }), {
      status: 405,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Supabase URL or Service Key is missing.");
    }
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    // Get authorization header
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    // Verify JWT and get user
    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader.replace('Bearer ', ''));
    if (authError || !user) {
      throw new Error('Invalid or expired token');
    }
    // Get user statistics using our stored function
    const { data: userStats, error: statsError } = await supabase.rpc('get_user_dream_stats', {
      user_uuid: user.id
    });
    if (statsError) {
      throw statsError;
    }
    // Get recent dreams for trend analysis
    const { data: recentDreams, error: dreamsError } = await supabase.from('dreams').select('created_at, dream_emotion, story_preference_genre, processing_status').eq('user_id', user.id).order('created_at', {
      ascending: false
    }).limit(30);
    if (dreamsError) {
      throw dreamsError;
    }
    // Get popular tags for this user
    const { data: userTags, error: tagsError } = await supabase.from('dreams').select(`
        dream_tags(
          tags(name, category, color)
        )
      `).eq('user_id', user.id).not('dream_tags', 'is', null).limit(20);
    if (tagsError) {
      console.warn('Tags query error:', tagsError);
    }
    // --- FIX 1: 명시적으로 타입 지정 ---
    // Analyze emotion trends over time
    const emotionTrends = recentDreams?.reduce((acc, dream)=>{
      if (dream.dream_emotion) {
        acc[dream.dream_emotion] = (acc[dream.dream_emotion] || 0) + 1;
      }
      return acc;
    }, {}) || {};
    // Analyze genre preferences
    const genrePreferences = recentDreams?.reduce((acc, dream)=>{
      if (dream.story_preference_genre) {
        acc[dream.story_preference_genre] = (acc[dream.story_preference_genre] || 0) + 1;
      }
      return acc;
    }, {}) || {};
    // Calculate weekly activity (last 4 weeks)
    const now = new Date();
    const weeklyActivity = [];
    for(let i = 3; i >= 0; i--){
      const weekEnd = new Date();
      weekEnd.setDate(now.getDate() - i * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 7);
      const weekDreams = recentDreams?.filter((dream)=>{
        const dreamDate = new Date(dream.created_at);
        return dreamDate >= weekStart && dreamDate < weekEnd;
      }).length || 0;
      weeklyActivity.push({
        week: `Week ${4 - i}`,
        dreams: weekDreams,
        startDate: weekStart.toISOString().split('T')[0],
        endDate: weekEnd.toISOString().split('T')[0]
      });
    }
    // Get processing success rate
    const processingStats = recentDreams?.reduce((acc, dream)=>{
      if (dream.processing_status) {
        acc[dream.processing_status] = (acc[dream.processing_status] || 0) + 1;
      }
      return acc;
    }, {}) || {};
    const successRate = recentDreams && recentDreams.length > 0 && processingStats.completed ? (processingStats.completed / recentDreams.length * 100).toFixed(1) : '0';
    // --- FIX 2: 명시적으로 타입 지정 ---
    // Extract commonly used tags
    const tagFrequency = {};
    if (userTags) {
      userTags.forEach((dream)=>{
        if (dream.dream_tags) {
          dream.dream_tags.forEach((tagRelation)=>{
            if (tagRelation.tags) {
              const tagName = tagRelation.tags.name;
              tagFrequency[tagName] = (tagFrequency[tagName] || 0) + 1;
            }
          });
        }
      });
    }
    // 정렬 로직 (이제 타입 에러가 발생하지 않습니다)
    const sortedTagEntries = Object.entries(tagFrequency).sort(([, countA], [, countB])=>countB - countA);
    const topTags = sortedTagEntries.slice(0, 10).map(([name, count])=>({
        name,
        count
      }));
    // Get user profile for personalization
    const { data: userProfile, error: profileError } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
    if (profileError) {
      console.warn('Profile query error:', profileError);
    }
    // 감정/장르 정렬
    const sortedEmotionEntries = Object.entries(emotionTrends).sort(([, countA], [, countB])=>countB - countA);
    const sortedGenreEntries = Object.entries(genrePreferences).sort(([, countA], [, countB])=>countB - countA);
    // Prepare comprehensive analytics response
    const analytics = {
      ...userStats,
      emotion_trends: emotionTrends,
      genre_preferences: genrePreferences,
      weekly_activity: weeklyActivity,
      processing_success_rate: parseFloat(successRate),
      processing_stats: processingStats,
      top_tags: topTags,
      insights: {
        most_active_emotion: sortedEmotionEntries[0]?.[0] || null,
        favorite_genre: sortedGenreEntries[0]?.[0] || null,
        consistency_score: calculateConsistencyScore(weeklyActivity),
        tag_diversity: Object.keys(tagFrequency).length
      },
      preferences: {
        default_genre: userProfile?.preferred_story_genre || 'mysterious',
        default_length: userProfile?.preferred_story_length || 'medium',
        language: userProfile?.default_language || 'ko',
        notifications: userProfile?.notifications_enabled ?? true
      }
    };
    return new Response(JSON.stringify({
      success: true,
      data: analytics
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error in user-analytics function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
// Helper function to calculate consistency score (0-100)
function calculateConsistencyScore(weeklyActivity) {
  if (!weeklyActivity || weeklyActivity.length === 0) return 0;
  const totalDreams = weeklyActivity.reduce((sum, week)=>sum + week.dreams, 0);
  if (totalDreams === 0) return 0;
  const average = totalDreams / weeklyActivity.length;
  if (average === 0) return 0;
  const variance = weeklyActivity.reduce((sum, week)=>{
    return sum + Math.pow(week.dreams - average, 2);
  }, 0) / weeklyActivity.length;
  const standardDeviation = Math.sqrt(variance);
  const coefficientOfVariation = standardDeviation / average;
  const consistencyScore = Math.max(0, (1 - coefficientOfVariation) * 100);
  return Math.round(Math.min(100, consistencyScore));
}
