/**
 * HTTP handler for POST /api/ai/section
 */
import { z } from 'zod';
import { readSectionAiLlmConfig, runSectionAiLlm } from './llm';

const requestSchema = z.object({
  scope: z.literal('section').optional(),
  prompt: z.string().min(1),
  sectionId: z.string().min(1),
  section: z.unknown(),
  portfolio: z.object({
    id: z.string(),
    name: z.string(),
    themeId: z.string().optional(),
  }),
});

export type SectionAiHandlerEnv = Record<string, string | undefined>;

function sendJson(
  res: {
    statusCode: number;
    setHeader: (name: string, value: string) => void;
    end: (body: string) => void;
  },
  status: number,
  body: unknown,
) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

async function readBody(
  req: AsyncIterable<Uint8Array | string | Buffer>,
): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

/**
 * Connect-style middleware for Vite / Node HTTP.
 */
export function createSectionAiMiddleware(getEnv: () => SectionAiHandlerEnv) {
  return async function sectionAiMiddleware(
    req: {
      method?: string;
      url?: string;
      [Symbol.asyncIterator]?: () => AsyncIterator<Uint8Array | string | Buffer>;
    } & AsyncIterable<Uint8Array | string | Buffer>,
    res: {
      statusCode: number;
      setHeader: (name: string, value: string) => void;
      end: (body: string) => void;
    },
    next: () => void,
  ) {
    const url = req.url ?? '';
    if (!url.startsWith('/api/ai/section')) {
      next();
      return;
    }

    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      sendJson(res, 204, {});
      return;
    }

    if (req.method !== 'POST') {
      sendJson(res, 405, { ok: false, error: 'Method not allowed' });
      return;
    }

    const config = readSectionAiLlmConfig(getEnv());
    if (!config) {
      // Client may fall back to the local planner.
      sendJson(res, 501, {
        ok: false,
        error:
          'Section AI LLM is not configured. Set OPENAI_API_KEY in .env (see .env.example).',
        source: 'remote',
        fallback: true,
      });
      return;
    }

    try {
      const raw = await readBody(req);
      const json = JSON.parse(raw) as unknown;
      const parsed = requestSchema.safeParse(json);
      if (!parsed.success) {
        sendJson(res, 400, {
          ok: false,
          error: parsed.error.issues[0]?.message ?? 'Invalid request',
          source: 'remote',
        });
        return;
      }

      const result = await runSectionAiLlm(config, {
        prompt: parsed.data.prompt,
        sectionId: parsed.data.sectionId,
        section: parsed.data.section,
        portfolio: parsed.data.portfolio,
      });

      sendJson(res, result.ok ? 200 : 422, result);
    } catch (error) {
      sendJson(res, 500, {
        ok: false,
        error: error instanceof Error ? error.message : 'Section AI failed',
        source: 'remote',
      });
    }
  };
}
