import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
Deno.serve(async (req)=>{
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders
    });
  }
  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
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
    const url = new URL(req.url);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const searchParams = url.searchParams;
    console.log('Manage dreams request:');
    console.log('Method:', req.method);
    console.log('Path segments:', pathSegments);
    console.log('Search params:', Object.fromEntries(searchParams.entries()));
    // GET /manage-dreams - List user's dreams with pagination and filtering
    if (req.method === 'GET' && !searchParams.get('id')) {
      const page = parseInt(searchParams.get('page') || '1');
      const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50);
      const offset = (page - 1) * limit;
      const searchQuery = searchParams.get('search') || '';
      const emotion = searchParams.get('emotion') || '';
      const genre = searchParams.get('genre') || '';
      const favorite = searchParams.get('favorite') === 'true';
      const sortBy = searchParams.get('sort') || 'created_at';
      const sortOrder = searchParams.get('order') || 'desc';
      let query = supabase.from('dreams_with_details').select('*').eq('user_id', user.id);
      // Apply filters
      if (searchQuery) {
        query = query.or(`dream_input_text.ilike.%${searchQuery}%,generated_story_title.ilike.%${searchQuery}%,generated_story_content.ilike.%${searchQuery}%`);
      }
      if (emotion) {
        query = query.eq('dream_emotion', emotion);
      }
      if (genre) {
        query = query.eq('story_preference_genre', genre);
      }
      if (favorite) {
        query = query.eq('is_favorite', true);
      }
      // Apply sorting and pagination
      query = query.order(sortBy, {
        ascending: sortOrder === 'asc'
      }).range(offset, offset + limit - 1);
      const { data: dreams, error: queryError, count } = await query;
      if (queryError) {
        throw queryError;
      }
      // Get total count for pagination
      const { count: totalCount } = await supabase.from('dreams').select('*', {
        count: 'exact',
        head: true
      }).eq('user_id', user.id);
      return new Response(JSON.stringify({
        success: true,
        data: dreams,
        pagination: {
          page,
          limit,
          total: totalCount || 0,
          pages: Math.ceil((totalCount || 0) / limit)
        }
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // Handle specific dream operations with ID
    const dreamId = searchParams.get('id');
    if (!dreamId) {
      throw new Error('Dream ID is required for this operation');
    }
    console.log('Processing dream operation for ID:', dreamId);
    // GET /manage-dreams?id={id} - Get specific dream
    if (req.method === 'GET' && dreamId) {
      const { data: dream, error: queryError } = await supabase.from('dreams_with_details').select('*').eq('id', dreamId).single();
      if (queryError) {
        console.error('Query error:', queryError);
        if (queryError.code === 'PGRST116') {
          throw new Error('Dream not found');
        }
        throw queryError;
      }
      console.log('Found dream:', {
        id: dream.id,
        title: dream.generated_story_title,
        user_id: dream.user_id
      });
      return new Response(JSON.stringify({
        success: true,
        data: dream
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // PUT /manage-dreams?id={id} - Update dream (toggle favorite, update tags, etc.)
    if (req.method === 'PUT' && dreamId) {
      const updates = await req.json();
      // Only allow certain fields to be updated
      const allowedUpdates = {
        is_favorite: updates.is_favorite,
        is_public: updates.is_public,
        dream_keywords: updates.dream_keywords,
        dream_emotion: updates.dream_emotion,
        dream_characters: updates.dream_characters,
        dream_objects: updates.dream_objects
      };
      // Remove undefined values
      Object.keys(allowedUpdates).forEach((key)=>{
        if (allowedUpdates[key] === undefined) {
          delete allowedUpdates[key];
        }
      });
      if (Object.keys(allowedUpdates).length === 0) {
        throw new Error('No valid updates provided');
      }
      console.log('Updating dream with:', allowedUpdates);
      const { data: updatedDream, error: updateError } = await supabase.from('dreams').update(allowedUpdates).eq('id', dreamId).eq('user_id', user.id).select().single();
      if (updateError) {
        throw updateError;
      }
      return new Response(JSON.stringify({
        success: true,
        data: updatedDream
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    // DELETE /manage-dreams?id={id} - Delete dream
    if (req.method === 'DELETE' && dreamId) {
      console.log('Deleting dream:', dreamId);
      const { error: deleteError } = await supabase.from('dreams').delete().eq('id', dreamId).eq('user_id', user.id);
      if (deleteError) {
        throw deleteError;
      }
      return new Response(JSON.stringify({
        success: true,
        message: 'Dream deleted successfully'
      }), {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      });
    }
    throw new Error('Method not allowed or invalid request');
  } catch (error) {
    console.error('Error in manage-dreams function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message || 'Internal server error'
    }), {
      status: error.message.includes('not found') ? 404 : error.message.includes('not allowed') ? 405 : 500,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      }
    });
  }
});
