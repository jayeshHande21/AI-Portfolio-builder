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
  fulfillPortfolioCodeAiJob,
  runSectionCodeAi,
} from './codeApi';
export type {
  FulfilledCodeAiJob,
  SectionCodeAiError,
  SectionCodeAiResult,
  SectionCodeAiSuccess,
} from './codeApi';
export { planSectionPatches } from './section';
export { planPortfolioPatches, pickThemeFromPrompt } from './portfolio';
export {
  planPortfolioCodeAiJobs,
  wantsCodeAi,
} from './portfolio/codeJobs';
export type { CodeAiKind, PortfolioCodeAiJob } from './portfolio/codeJobs';
export {
  isStyleIntent,
  mergeDesignTokens,
  planStyleChanges,
} from './style';
export type { StylePlan } from './style';
