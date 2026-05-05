const API_CONFIG = {
  LOCAL_BACKEND_URL: 'http://localhost:3001/api/generate-image',
  CLOUDFLARE_WORKER_URL: process.env.REACT_APP_CLOUDFLARE_WORKER_URL || '',
  CLOUDFLARE_API_KEY: process.env.REACT_APP_CLOUDFLARE_API_KEY || '',
  USE_REAL_AI: true,
};

export const AVAILABLE_MODELS = [
  { id: '@cf/stabilityai/stable-diffusion-xl-base-1.0', name: 'Stable Diffusion XL Base 1.0' },
  { id: '@cf/blackforestlabs/ux-1-schnell', name: 'UX-1 Schnell' },
  { id: '@cf/bytedance/stable-diffusion-xl-lightning', name: 'Stable Diffusion XL Lightning' },
  { id: '@cf/lykon/dreamshaper-8-lcm', name: 'DreamShaper 8 LCM' },
  { id: '@cf/runwayml/stable-diffusion-v1-5-img2img', name: 'Stable Diffusion v1.5 Img2Img' },
  { id: '@cf/runwayml/stable-diffusion-v1-5-inpainting', name: 'Stable Diffusion v1.5 Inpainting' },
];

const generateWithBackend = async (prompt, model) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(API_CONFIG.LOCAL_BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const blob = await response.blob();

    if (!blob || blob.size === 0) {
      throw new Error('Received empty image');
    }

    const imageUrl = URL.createObjectURL(blob);

    return {
      imageUrl,
      title: prompt || 'AI Generated Image',
      generatedAt: new Date().toISOString(),
      source: 'cloudflare-via-backend',
      model,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timed out. Please try again.');
    }
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to backend server. Please start the backend: cd backend && npm start');
    }
    throw error;
  }
};

const generateWithCloudflareDirect = async (prompt, model) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 60000);

  try {
    const response = await fetch(API_CONFIG.CLOUDFLARE_WORKER_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_CONFIG.CLOUDFLARE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        model,
      }),
      signal: controller.signal,
      mode: 'cors',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();

    if (!blob || blob.size === 0) {
      throw new Error('Received empty image');
    }

    const imageUrl = URL.createObjectURL(blob);

    return {
      imageUrl,
      title: prompt || 'AI Generated Image',
      generatedAt: new Date().toISOString(),
      source: 'cloudflare-direct',
      model,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const generateAIImage = async (prompt, model = '@cf/stabilityai/stable-diffusion-xl-base-1.0') => {
  if (!API_CONFIG.USE_REAL_AI) {
    throw new Error('Real AI is not enabled');
  }

  try {
    return await generateWithBackend(prompt, model);
  } catch (backendError) {
    console.log('Backend failed, trying direct:', backendError.message);
    try {
      return await generateWithCloudflareDirect(prompt, model);
    } catch (directError) {
      throw new Error(`Image generation failed: ${directError.message}`);
    }
  }
};

export const isRealAIConfigured = () => {
  return API_CONFIG.USE_REAL_AI && !!API_CONFIG.CLOUDFLARE_WORKER_URL && !!API_CONFIG.CLOUDFLARE_API_KEY;
};

const aiImageService = {
  generateAIImage,
  isRealAIConfigured,
};

export default aiImageService;
