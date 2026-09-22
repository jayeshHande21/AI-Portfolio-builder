export type {
  AiScope,
  PortfolioAiError,
  PortfolioAiRequest,
  PortfolioAiResponse,
  PortfolioAiResult,
  SectionAiContext,
  SectionAiError,
  SectionAiRequest,
  SectionAiResponse,
  SectionAiResult,
} from './types';
export { runSectionAi } from './api';
export { runPortfolioAi } from './portfolioApi';
export {
  buildReplacePatchForCustomComponent,
  runSectionCodeAi,
} from './codeApi';
export type {
  SectionCodeAiError,
  SectionCodeAiResult,
  SectionCodeAiSuccess,
} from './codeApi';
export { planSectionPatches } from './section';
export { planPortfolioPatches, pickThemeFromPrompt } from './portfolio';
