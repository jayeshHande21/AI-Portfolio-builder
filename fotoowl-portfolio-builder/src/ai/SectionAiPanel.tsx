import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useEditorStore } from '../editor/state';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
};

const SUGGESTIONS = [
  'Make this more premium',
  'Put the image on the right',
  'Create a completely new About section',
  'Title: Stories in Soft Light',
];

/**
 * Section AI panel — prompt → structured patches → Blueprint.
 * Opens from the section action bar (alongside copy / delete).
 */
export function SectionAiPanel() {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const blueprint = useEditorStore((s) => s.blueprint);
  const loading = useEditorStore((s) => s.sectionAiLoading);
  const runSectionAiPrompt = useEditorStore((s) => s.runSectionAiPrompt);
  const closeSectionAi = useEditorStore((s) => s.closeSectionAi);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'sys',
      role: 'system',
      text: 'Describe the change for this section. Section AI returns Blueprint patches only.',
    },
  ]);

  const selected = blueprint.sections.find((s) => s.id === selectedNodeId);

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

    const result = await runSectionAiPrompt(trimmed);
    setMessages((prev) => [
      ...prev,
      {
        id: `a_${Date.now()}`,
        role: 'assistant',
        text: result.ok
          ? result.summary ?? 'Applied section patches.'
          : result.error ?? 'Something went wrong.',
      },
    ]);
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void submit(prompt);
  };

  return (
    <section className="fo-section-ai" aria-label="Section AI">
      <header className="fo-section-ai__header">
        <Sparkles size={16} aria-hidden />
        <div className="fo-section-ai__heading">
          <p className="fo-section-ai__eyebrow">Section AI</p>
          <p className="fo-section-ai__target">
            {selected
              ? `${selected.id} · ${selected.component ?? selected.type}`
              : 'No section selected'}
          </p>
        </div>
        <button
          type="button"
          className="fo-section-ai__close"
          onClick={closeSectionAi}
          aria-label="Close Section AI"
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
            disabled={!selected || loading}
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
        <label className="fo-sr-only" htmlFor="section-ai-prompt">
          Section AI prompt
        </label>
        <textarea
          ref={inputRef}
          id="section-ai-prompt"
          className="fo-section-ai__input"
          rows={4}
          value={prompt}
          disabled={!selected || loading}
          placeholder={
            selected
              ? 'e.g. Make this About more premium and put the image on the left'
              : 'Select a section in the canvas first'
          }
          onChange={(event) => setPrompt(event.target.value)}
        />
        <button
          type="submit"
          className="fo-section-ai__submit"
          disabled={!selected || loading || !prompt.trim()}
        >
          {loading ? 'Planning…' : 'Apply with AI'}
        </button>
      </form>
    </section>
  );
}
