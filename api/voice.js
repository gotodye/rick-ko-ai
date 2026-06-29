export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const VOICE_ID = process.env.ELEVENLABS_VOICE_ID || 'IKne3meq5aSn9XLyUdCD';
  const XI_KEY = process.env.ELEVENLABS_API_KEY;

  if (!XI_KEY) {
    return res.status(500).json({ error: 'ELEVENLABS_API_KEY not set' });
  }

  try {
    const url = 'https://api.elevenlabs.io/v1/text-to-speech/' + VOICE_ID;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'xi-api-key': XI_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: req.body.text,
        model_id: 'eleven_multilingual_v2',
        voice_settings: {
          stability: 0.45,
          similarity_boost: 0.82,
          style: 0.25,
          use_speaker_boost: true
        }
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({
        error: err.detail?.message || 'ElevenLabs error ' + response.status,
        key_prefix: XI_KEY.slice(0, 8)
      });
    }

    const audioBuffer = await response.arrayBuffer();
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    return res.status(200).send(Buffer.from(audioBuffer));
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}