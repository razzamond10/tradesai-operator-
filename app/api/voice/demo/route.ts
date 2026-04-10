export async function GET(request: Request) {
  const text = "Hello, thanks for calling your business. How can I help with your inquiry today?";
  const voiceId = "custom_voice_45948606e29a6b033b2486ae6d";
  const apiKey = process.env.ELEVENLABS_API_KEY;
  
  console.log('[VOICE_DEMO] API Key present:', !!apiKey);
  console.log('[VOICE_DEMO] Voice ID:', voiceId);
  
  if (!apiKey) {
    console.error('[VOICE_DEMO] ERROR: ELEVENLABS_API_KEY not set');
    return new Response(JSON.stringify({ error: 'API key not configured' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
  
  try {
    console.log('[VOICE_DEMO] Calling ElevenLabs API...');
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'xi-api-key': apiKey,
      },
      body: JSON.stringify({
        text: text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    });

    console.log('[VOICE_DEMO] ElevenLabs response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[VOICE_DEMO] ElevenLabs error:', response.status, errorText);
      return new Response(JSON.stringify({ error: `ElevenLabs error: ${response.status}`, details: errorText }), { status: response.status, headers: { 'Content-Type': 'application/json' } });
    }

    const audioBuffer = await response.arrayBuffer();
    console.log('[VOICE_DEMO] Success! Audio buffer size:', audioBuffer.byteLength);
    
    return new Response(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error('[VOICE_DEMO] Fatal error:', error);
    return new Response(JSON.stringify({ error: 'Voice generation failed', details: String(error) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
