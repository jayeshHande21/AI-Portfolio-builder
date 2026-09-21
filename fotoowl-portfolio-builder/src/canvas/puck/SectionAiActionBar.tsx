import type { ReactNode, SyntheticEvent } from 'react';
import { ActionBar, useGetPuck } from '@puckeditor/core';
import { Sparkles } from 'lucide-react';
import { useEditorStore } from '../../editor/state';

type SectionAiActionBarProps = {
  children: ReactNode;
  label?: string;
  parentAction?: ReactNode;
};

/**
 * Extends Puck's section action bar (duplicate / delete / …) with Section AI.
 * Opens the right-side Section AI rail for the currently selected section.
 */
export function SectionAiActionBar({
  children,
  label,
  parentAction,
}: SectionAiActionBarProps) {
  const getPuck = useGetPuck();
  const sectionAiOpen = useEditorStore((s) => s.sectionAiOpen);
  const openSectionAi = useEditorStore((s) => s.openSectionAi);

  const onOpenAi = (event: SyntheticEvent) => {
    event.stopPropagation();
    const selected = getPuck().selectedItem;
    const id = selected?.props?.id;
    openSectionAi(typeof id === 'string' ? id : null);
  };

  return (
    <ActionBar label={label}>
      {parentAction}
      <ActionBar.Group>{children}</ActionBar.Group>
      <ActionBar.Separator />
      <ActionBar.Group>
        <ActionBar.Action
          label="Section AI"
          active={sectionAiOpen}
          onClick={onOpenAi}
        >
          <Sparkles size={14} aria-hidden />
        </ActionBar.Action>
      </ActionBar.Group>
    </ActionBar>
  );
}
