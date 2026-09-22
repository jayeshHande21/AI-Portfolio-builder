import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useEditorStore } from '../editor/state';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
};

const SUGGESTIONS = [
  'Create a premium wedding photography portfolio',
  'Build a dark studio fashion portfolio',
  'Make the entire portfolio more premium',
  'Make the palette warmer',
  'Use a cooler coastal palette',
  'Add more spacing and polish the look',
  'Create a custom footer for the whole site',
  'Add a brand-new custom section',
  'Switch to a coastal portrait look',
];

/**
 * Portfolio AI panel — prompt → theme + patches → Blueprint.
 * Opens from the editor toolbar (portfolio-scoped, not selection-bound).
 */
export function PortfolioAiPanel() {
  const loading = useEditorStore((s) => s.portfolioAiLoading);
  const runPortfolioAiPrompt = useEditorStore((s) => s.runPortfolioAiPrompt);
  const closePortfolioAi = useEditorStore((s) => s.closePortfolioAi);
  const blueprint = useEditorStore((s) => s.blueprint);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'sys',
      role: 'system',
      text: 'Describe the whole portfolio you want. Portfolio AI can switch themes, restyle copy/Style AI, and queue Code AI for brand-new custom React sections. For one section only, use Section AI from the canvas action bar.',
    },
  ]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const submit = async (value: string) => {
    const trimmed = value.trim();
    if (!trimmed || loading) return;

    setMessages((prev) => [
      ...prev,
      { id: `u_${Date.now()}`, role: 'user', text: trimmed },
    ]);
    setPrompt('');

    const result = await runPortfolioAiPrompt(trimmed);
    setMessages((prev) => [
      ...prev,
      {
        id: `a_${Date.now()}`,
        role: 'assistant',
        text: result.ok
          ? result.summary ?? 'Applied portfolio changes.'
          : result.error ?? 'Something went wrong.',
      },
    ]);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit(prompt);
  };

  return (
    <section className="fo-section-ai" aria-label="Portfolio AI">
      <header className="fo-section-ai__header">
        <Sparkles size={16} aria-hidden />
        <div className="fo-section-ai__heading">
          <p className="fo-section-ai__eyebrow">Portfolio AI</p>
          <p className="fo-section-ai__target">
            {blueprint.name}
            {blueprint.themeId ? ` · ${blueprint.themeId}` : ''}
          </p>
        </div>
        <button
          type="button"
          className="fo-section-ai__close"
          onClick={closePortfolioAi}
          aria-label="Close Portfolio AI"
        >
          <X size={16} aria-hidden />
        </button>
      </header>

      <div className="fo-section-ai__suggestions">
        {SUGGESTIONS.map((item) => (
          <button
            key={item}
            type="button"
            className="fo-section-ai__chip"
            disabled={loading}
            onClick={() => void submit(item)}
          >
            {item}
          </button>
        ))}
      </div>

      <div className="fo-section-ai__thread" role="log" aria-live="polite">
        {messages.map((message) => (
          <p
            key={message.id}
            className={`fo-section-ai__msg fo-section-ai__msg--${message.role}`}
          >
            {message.text}
          </p>
        ))}
      </div>

      <form className="fo-section-ai__form" onSubmit={onSubmit}>
        <label className="fo-sr-only" htmlFor="portfolio-ai-prompt">
          Portfolio AI prompt
        </label>
        <textarea
          ref={inputRef}
          id="portfolio-ai-prompt"
          className="fo-section-ai__input"
          rows={4}
          value={prompt}
          disabled={loading}
          placeholder='e.g. Create a premium wedding portfolio with cinematic hero and masonry gallery'
          onChange={(event) => setPrompt(event.target.value)}
        />
        <button
          type="submit"
          className="fo-section-ai__submit"
          disabled={loading || !prompt.trim()}
        >
          {loading ? 'Working…' : 'Build with AI'}
        </button>
      </form>
    </section>
  );
}
