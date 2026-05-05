const API_CONFIG = {
  LOCAL_BACKEND_URL: 'http://localhost:3001/api/generate-image',
  REPLICATE_API_KEY: process.env.REACT_APP_REPLICATE_API_KEY || '',
  TOGETHER_API_KEY: process.env.REACT_APP_TOGETHER_API_KEY || '',
  OPENAI_API_KEY: process.env.REACT_APP_OPENAI_API_KEY || '',
  CLOUDFLARE_WORKER_URL: process.env.REACT_APP_CLOUDFLARE_WORKER_URL || '',
  CLOUDFLARE_API_KEY: process.env.REACT_APP_CLOUDFLARE_API_KEY || '',
  USE_REAL_AI: true,
};

export const AI_SOURCES = [
  {
    id: 'openai',
    name: 'OpenAI DALL-E 3 (Best Quality)',
    models: [
      { id: 'dall-e-3', name: 'DALL-E 3 (HD Quality)' },
      { id: 'dall-e-2', name: 'DALL-E 2 (Faster)' },
    ],
    defaultModel: 'dall-e-3',
  },
  {
    id: 'replicate',
    name: 'Replicate (FLUX.1)',
    models: [
      { id: 'black-forest-labs/flux-dev', name: 'FLUX.1 Dev (High Quality)' },
      {
        id: 'black-forest-labs/flux-schnell',
        name: 'FLUX.1 Schnell (Fastest)',
      },
      {
        id: 'stabilityai/stable-diffusion-xl-base-1.0',
        name: 'Stable Diffusion XL',
      },
    ],
    defaultModel: 'black-forest-labs/flux-dev',
  },
  {
    id: 'together',
    name: 'Together AI (Fast)',
    models: [
      {
        id: 'black-forest-labs/FLUX.1-schnell-Free',
        name: 'FLUX.1 Schnell (Free)',
      },
      { id: 'black-forest-labs/FLUX.1-dev', name: 'FLUX.1 Dev' },
      {
        id: 'stabilityai/stable-diffusion-xl-base-1.0',
        name: 'Stable Diffusion XL',
      },
    ],
    defaultModel: 'black-forest-labs/FLUX.1-schnell-Free',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Worker (Free)',
    models: [
      {
        id: '@cf/blackforestlabs/flux-1-schnell',
        name: 'FLUX.1 Schnell (Best on CF)',
      },
      {
        id: '@cf/stabilityai/stable-diffusion-xl-base-1.0',
        name: 'Stable Diffusion XL Base 1.0',
      },
      {
        id: '@cf/bytedance/stable-diffusion-xl-lightning',
        name: 'SDXL Lightning',
      },
      { id: '@cf/lykon/dreamshaper-8-lcm', name: 'DreamShaper 8 LCM' },
    ],
    defaultModel: '@cf/blackforestlabs/flux-1-schnell',
  },
];

const generateWithBackend = async (prompt, model, source) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 120000);

  try {
    const response = await fetch(API_CONFIG.LOCAL_BACKEND_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, model, source }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response
        .json()
        .catch(() => ({ error: 'Unknown error' }));
      throw new Error(errorData.error || `Server error: ${response.status}`);
    }

    const blob = await response.blob();
    if (!blob || blob.size === 0) throw new Error('Received empty image');

    const imageUrl = URL.createObjectURL(blob);
    return {
      imageUrl,
      title: prompt || 'AI Generated Image',
      generatedAt: new Date().toISOString(),
      source,
      model,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError')
      throw new Error('Request timed out. Please try again.');
    if (error.message.includes('Failed to fetch')) {
      throw new Error(
        'Cannot connect to backend server. Start it: cd backend && npm start',
      );
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
      body: JSON.stringify({ prompt, model }),
      signal: controller.signal,
      mode: 'cors',
    });

    clearTimeout(timeoutId);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const blob = await response.blob();
    if (!blob || blob.size === 0) throw new Error('Received empty image');

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

export const getSourceModels = (sourceId) => {
  const source = AI_SOURCES.find((s) => s.id === sourceId);
  return source ? source.models : [];
};

export const getDefaultModel = (sourceId) => {
  const source = AI_SOURCES.find((s) => s.id === sourceId);
  return source ? source.defaultModel : '';
};

export const isSourceConfigured = (sourceId) => {
  switch (sourceId) {
    case 'openai':
      return !!API_CONFIG.OPENAI_API_KEY;
    case 'replicate':
      return !!API_CONFIG.REPLICATE_API_KEY;
    case 'together':
      return !!API_CONFIG.TOGETHER_API_KEY;
    case 'cloudflare':
      return (
        !!API_CONFIG.CLOUDFLARE_WORKER_URL && !!API_CONFIG.CLOUDFLARE_API_KEY
      );
    default:
      return false;
  }
};

export const isRealAIConfigured = () => {
  return (
    API_CONFIG.USE_REAL_AI &&
    (isSourceConfigured('openai') ||
      isSourceConfigured('replicate') ||
      isSourceConfigured('together') ||
      isSourceConfigured('cloudflare'))
  );
};

export const generateAIImage = async (prompt, model, source = 'cloudflare') => {
  if (!API_CONFIG.USE_REAL_AI) throw new Error('Real AI is not enabled');

  try {
    return await generateWithBackend(prompt, model, source);
  } catch (backendError) {
    console.log(
      'Backend failed, trying direct Cloudflare:',
      backendError.message,
    );
    if (source === 'cloudflare') {
      try {
        return await generateWithCloudflareDirect(prompt, model);
      } catch (directError) {
        throw new Error(`Image generation failed: ${directError.message}`);
      }
    }
    throw backendError;
  }
};

export const getAvailableSources = () => {
  return AI_SOURCES.filter((s) => isSourceConfigured(s.id));
};

const aiImageService = {
  generateAIImage,
  isSourceConfigured,
  getAvailableSources,
};
export default aiImageService;
