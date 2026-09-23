import { StyleMatchResult } from './scorer';

export interface LLMGatewayConfig {
  provider?: 'gemini' | 'openai' | 'local_template';
  apiKey?: string;
  gatewayUrl?: string;
}

export async function generateStyleMatchExplanation(
  productName: string,
  category: string,
  styleMatch: StyleMatchResult,
  config: LLMGatewayConfig = {}
): Promise<string> {
  const { overallScore, confidenceScore, dimensions, analysisJson } = styleMatch;

  // Extract structured tokens (strictly text & numerical metadata, NEVER video or images)
  const knownDims = Object.entries(dimensions)
    .filter(([_, d]) => d.status === 'known')
    .map(([k, d]) => `${k}: ${d.score}/100 (${d.evidence})`)
    .join(', ');

  const prompt = `You are the StyleTry AI Editorial Stylist.
Garment: "${productName}" (${category}).
Deterministic Style Match: ${overallScore}/100.
Confidence Score: ${confidenceScore}%.
Evaluated Dimensions: ${knownDims}.
Evidence: ${analysisJson.evidenceTokens.join(', ')}.

Rules:
1. Provide a concise 2-sentence luxury editorial explanation of this Style Match.
2. NEVER mention or judge physical body shape, weight, attractiveness, age, or ethnicity.
3. Use neutral, elegant fashion terminology (drape, balance, harmony, palette).
4. Strictly reflect the given Style Match score of ${overallScore}/100 without inventing different scores.`;

  const provider = config.provider || (process.env.GEMINI_API_KEY ? 'gemini' : 'local_template');

  // If Gemini API Key is available on server
  if (provider === 'gemini' && process.env.GEMINI_API_KEY) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 120, temperature: 0.3 },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 10) {
          return sanitizeStylistText(text.trim());
        }
      }
    } catch (e) {
      console.warn('LLM Gateway Gemini request failed, using local template:', e);
    }
  }

  // High-elegance fallback local template (deterministic, zero latency, zero failure risk)
  return generateDeterministicEditorialText(productName, overallScore, dimensions);
}

function generateDeterministicEditorialText(
  productName: string,
  score: number,
  dimensions: StyleMatchResult['dimensions']
): string {
  const fitEv = dimensions.fitPreference?.evidence || 'refined tailoring';
  const colorEv = dimensions.color?.evidence || 'balanced palette contrast';

  if (score >= 90) {
    return `An exceptional pairing. ${productName} presents ${fitEv} while highlighting ${colorEv} for a polished, cohesive silhouette.`;
  }
  if (score >= 75) {
    return `${productName} harmonizes well with your style preferences, offering ${fitEv} with versatile styling potential.`;
  }
  return `${productName} offers an intriguing accent piece, pairing distinct silhouette lines with ${colorEv}.`;
}

function sanitizeStylistText(text: string): string {
  // Strip out any accidental quotes or formatting artifacts
  let clean = text.replace(/^["']|["']$/g, '').trim();

  // Guard against forbidden judgment words
  const forbidden = [/attractive/i, /skinny/i, /fat/i, /weight/i, /flattering on your body/i, /ethnicity/i];
  for (const pattern of forbidden) {
    clean = clean.replace(pattern, 'refined');
  }

  return clean;
}
