/**
 * Vite plugin: AI middleware for Section / Code / Portfolio routes.
 * Secrets are read from process env / .env (never VITE_* client exposure).
 */
import type { Plugin } from 'vite';
import { loadEnv } from 'vite';
import { createSectionAiMiddleware } from './sectionAi/handler';

export function sectionAiPlugin(): Plugin {
  return {
    name: 'fotoowl-section-ai',
    configureServer(server) {
      const env = {
        ...loadEnv(server.config.mode, server.config.root, ''),
        ...process.env,
      };

      server.middlewares.use(
        createSectionAiMiddleware(() => env as Record<string, string | undefined>),
      );
    },
  };
}
