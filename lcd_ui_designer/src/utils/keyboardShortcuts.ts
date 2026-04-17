import { useDesignerStore } from '../store/useDesignerStore';

const isEditableElement = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);

export const createKeyboardShortcutsHandler = () => (e: KeyboardEvent) => {
  const s = useDesignerStore.getState();
  const key = e.key.toLowerCase();
  const ctrlOrMeta = e.ctrlKey || e.metaKey;
  const inEditable = isEditableElement(e.target);

  if (ctrlOrMeta && key === 'c') {
    e.preventDefault();
    s.copySelection();
    return;
  }
  if (ctrlOrMeta && key === 'v') {
    e.preventDefault();
    s.pasteSelection();
    return;
  }
  if (ctrlOrMeta && key === 'x') {
    e.preventDefault();
    s.cutSelection();
    return;
  }
  if (ctrlOrMeta && key === 'd') {
    e.preventDefault();
    s.duplicateSelectedFrame();
    return;
  }
  if (e.key === 'Delete' || e.key === 'Backspace') {
    if (inEditable) return;
    e.preventDefault();
    s.clearSelection();
    return;
  }

  if (e.key === 'ArrowUp') {
    e.preventDefault();
    s.moveSelection(0, -1);
    return;
  }
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    s.moveSelection(0, 1);
    return;
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    s.moveSelection(-1, 0);
    return;
  }
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    s.moveSelection(1, 0);
    return;
  }

  if (e.code === 'Space' && s.tab === 'layout') {
    if (inEditable) return;
    e.preventDefault();
    s.drawAtSelection();
  }
};
