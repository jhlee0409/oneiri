import "jsr:@supabase/functions-js/edge-runtime.d.ts";
Deno.serve(async (req)=>{
  // CORS 헤더 설정
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
      }
    });
  }
  try {
    console.log('=== Image Generation Function Started ==>');
    if (req.method !== 'POST') {
      console.log('Error: Method not allowed:', req.method);
      return new Response(JSON.stringify({
        error: 'Method not allowed'
      }), {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    const requestBody = await req.json();
    console.log('Request body received:', JSON.stringify(requestBody, null, 2));
    const { dreamId, imagePrompt } = requestBody;
    if (!dreamId || !imagePrompt) {
      console.log('Error: Missing required fields. dreamId:', dreamId, 'imagePrompt:', imagePrompt);
      return new Response(JSON.stringify({
        error: 'dreamId and imagePrompt are required'
      }), {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    // Gemini API 키 확인
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');
    if (!geminiApiKey) {
      console.log('Error: Gemini API key not configured');
      return new Response(JSON.stringify({
        error: 'Gemini API key not configured'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    console.log('Gemini API key found, length:', geminiApiKey.length);
    // Supabase 클라이언트 초기화
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    console.log('Supabase client initialized');
    // 이미지 생성 프롬프트 최적화
    const optimizedPrompt = `Create a dreamlike, artistic image based on this description: ${imagePrompt}. Style: surreal, ethereal, dreamy atmosphere with soft lighting and mystical elements. High quality, detailed, photorealistic rendering.`;
    console.log('Optimized prompt:', optimizedPrompt);
    // Gemini 2.0 Flash Preview Image Generation API 호출
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-preview-image-generation:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: optimizedPrompt
              }
            ]
          }
        ],
        generationConfig: {
          responseModalities: [
            "TEXT",
            "IMAGE"
          ],
          temperature: 0.7,
          topK: 32,
          topP: 1
        }
      })
    });
    console.log('Gemini API response status:', geminiResponse.status);
    if (!geminiResponse.ok) {
      const errorText = await geminiResponse.text();
      console.error('Gemini API Error Response:', errorText);
      return new Response(JSON.stringify({
        error: 'Failed to generate image',
        details: `Gemini API returned ${geminiResponse.status}: ${errorText}`
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    const geminiData = await geminiResponse.json();
    console.log('Gemini API response data:', JSON.stringify(geminiData, null, 2));
    if (geminiData.error) {
      console.error('Gemini API returned error:', geminiData.error);
      return new Response(JSON.stringify({
        error: `Gemini API error: ${geminiData.error.message}`
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    // 생성된 이미지 데이터 추출
    const candidate = geminiData.candidates?.[0];
    if (!candidate) {
      console.error('No candidates found in response');
      return new Response(JSON.stringify({
        error: 'No candidates found in response'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    const imagePart = candidate.content?.parts?.find((part)=>part.inlineData);
    if (!imagePart?.inlineData) {
      console.error('No image data found in response parts');
      console.log('Available parts:', candidate.content?.parts?.map((p)=>({
          hasText: !!p.text,
          hasInlineData: !!p.inlineData
        })));
      return new Response(JSON.stringify({
        error: 'No image data found in response'
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    console.log('Image data found, MIME type:', imagePart.inlineData.mimeType);
    console.log('Image data length:', imagePart.inlineData.data.length);
    // Base64 이미지 데이터를 Buffer로 변환
    const imageBuffer = Uint8Array.from(atob(imagePart.inlineData.data), (c)=>c.charCodeAt(0));
    const fileName = `dream-${dreamId}-${Date.now()}.png`;
    const filePath = `images/${fileName}`;
    console.log('Uploading to Supabase Storage:', filePath);
    // Supabase Storage에 이미지 업로드
    const { data: uploadData, error: uploadError } = await supabase.storage.from('dream-images').upload(filePath, imageBuffer, {
      contentType: 'image/png',
      upsert: false
    });
    if (uploadError) {
      console.error('Storage upload error:', uploadError);
      return new Response(JSON.stringify({
        error: 'Failed to upload image to storage',
        details: uploadError.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    console.log('Image uploaded successfully:', uploadData);
    // 업로드된 이미지의 공개 URL 생성
    const { data: urlData } = supabase.storage.from('dream-images').getPublicUrl(filePath);
    const imageUrl = urlData.publicUrl;
    console.log('Generated public URL:', imageUrl);
    // dreams 테이블의 generated_image_url 업데이트
    const { error: updateError } = await supabase.from('dreams').update({
      generated_image_url: imageUrl,
      updated_at: new Date().toISOString()
    }).eq('id', dreamId);
    if (updateError) {
      console.error('Database update error:', updateError);
      return new Response(JSON.stringify({
        error: 'Failed to update dream record',
        details: updateError.message
      }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    console.log('Database updated successfully');
    // 성공 응답
    return new Response(JSON.stringify({
      success: true,
      imageUrl: imageUrl,
      message: 'Image generated and saved successfully'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Function error:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
});
