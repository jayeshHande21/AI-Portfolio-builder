/**
 * HTTP handlers for Section AI + Code AI (V2).
 */
import { z } from 'zod';
import { runCodeAi } from '../codeAi/llm';
import { readSectionAiLlmConfig, runSectionAiLlm } from './llm';

const sectionRequestSchema = z.object({
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

const codeRequestSchema = z.object({
  prompt: z.string().min(1),
  sectionId: z.string().min(1),
  componentId: z.string().regex(/^custom\.[a-z0-9_]+$/),
  cssScope: z.string().min(1),
  section: z.object({
    component: z.string().optional(),
    props: z.record(z.string(), z.unknown()).optional(),
  }),
  portfolio: z.object({
    id: z.string(),
    name: z.string(),
    themeId: z.string().optional(),
  }),
});

export type SectionAiHandlerEnv = Record<string, string | undefined>;

type Res = {
  statusCode: number;
  setHeader: (name: string, value: string) => void;
  end: (body: string) => void;
};

type Req = {
  method?: string;
  url?: string;
} & AsyncIterable<Uint8Array | string | Buffer>;

function sendJson(res: Res, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

async function readBody(req: AsyncIterable<Uint8Array | string | Buffer>) {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(
      typeof chunk === 'string' ? Buffer.from(chunk) : Buffer.from(chunk),
    );
  }
  return Buffer.concat(chunks).toString('utf8');
}

/**
 * Connect-style middleware for Vite / Node HTTP.
 * Routes:
 * - POST /api/ai/section
 * - POST /api/ai/section/code
 */
export function createSectionAiMiddleware(getEnv: () => SectionAiHandlerEnv) {
  return async function sectionAiMiddleware(
    req: Req,
    res: Res,
    next: () => void,
  ) {
    const url = (req.url ?? '').split('?')[0] ?? '';

    if (url !== '/api/ai/section' && url !== '/api/ai/section/code') {
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

    try {
      const raw = await readBody(req);
      const json = JSON.parse(raw) as unknown;

      if (url === '/api/ai/section/code') {
        await handleCodeAi(getEnv(), json, res);
        return;
      }

      await handleSectionAi(getEnv(), json, res);
    } catch (error) {
      sendJson(res, 500, {
        ok: false,
        error: error instanceof Error ? error.message : 'AI request failed',
        source: 'remote',
      });
    }
  };
}

async function handleSectionAi(
  env: SectionAiHandlerEnv,
  json: unknown,
  res: Res,
) {
  const config = readSectionAiLlmConfig(env);
  if (!config) {
    sendJson(res, 501, {
      ok: false,
      error:
        'Section AI LLM is not configured. Set OPENAI_API_KEY in .env (see .env.example).',
      source: 'remote',
      fallback: true,
    });
    return;
  }

  const parsed = sectionRequestSchema.safeParse(json);
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
}

async function handleCodeAi(
  env: SectionAiHandlerEnv,
  json: unknown,
  res: Res,
) {
  const parsed = codeRequestSchema.safeParse(json);
  if (!parsed.success) {
    sendJson(res, 400, {
      ok: false,
      error: parsed.error.issues[0]?.message ?? 'Invalid request',
      source: 'remote',
    });
    return;
  }

  const result = await runCodeAi(env, parsed.data);
  if (!result.ok) {
    sendJson(res, 422, result);
    return;
  }

  sendJson(res, 200, {
    ok: true,
    summary: result.summary,
    definition: result.definition,
    source: result.source,
  });
}
