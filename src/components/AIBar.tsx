import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Sparkles, ArrowUp, Command } from 'lucide-react';

interface AIBarProps {
  pageId: string;
  onSubmit: (prompt: string) => void;
  context: string | null;
  onClearContext: () => void;
  onFocus: () => void;
  isFocused: boolean;
  onBlur: () => void;
  sidebarWidth: number;
}

interface QuickAnalysisItem {
  label: string;
  prompt: string;
}

interface QuickAnalysisCategory {
  name: string;
  items: QuickAnalysisItem[];
}

const QUICK_ANALYSIS: QuickAnalysisCategory[] = [
  {
    name: 'Fleet',
    items: [
      { label: 'Compare Q1 and Q2 fleet spend', prompt: 'Hi Edenred AI, please show the difference between Q1 and Q2 fleet spend in a line chart.' },
      { label: 'Show critical operational risks', prompt: 'Show me all critical operational risks across the fleet right now.' },
      { label: 'Show the largest savings opportunities', prompt: 'Show me the largest fleet savings opportunities available now.' },
    ],
  },
  {
    name: 'Cards',
    items: [
      { label: 'Show cards expiring in 90 days', prompt: 'Show me all fleet cards expiring in the next 90 days with renewal status.' },
      { label: 'Generate a renewal report', prompt: 'Generate a card renewal report for the current quarter.' },
    ],
  },
  {
    name: 'Charging',
    items: [
      { label: 'Explain charging-cost increase', prompt: 'Explain why EV charging costs increased this quarter.' },
      { label: 'Compare charging cost by country', prompt: 'Compare EV charging costs by country for this quarter.' },
    ],
  },
  {
    name: 'Analytics',
    items: [
      { label: 'Forecast next month charging demand', prompt: 'Forecast next month\u2019s charging demand.' },
      { label: 'Show fuel vs charging spend', prompt: 'Compare fuel and EV charging spend for this quarter.' },
    ],
  },
];

export function AIBar({ onSubmit, context, onClearContext, onFocus, isFocused, onBlur, sidebarWidth }: AIBarProps) {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    function handler(e: globalThis.KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  function handleSubmit() {
    if (!value.trim()) return;
    onSubmit(value.trim());
    setValue('');
    onBlur();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
    if (e.key === 'Escape') {
      inputRef.current?.blur();
      onBlur();
    }
  }

  function handleSuggestionClick(item: QuickAnalysisItem) {
    onSubmit(item.prompt);
    onBlur();
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-none">
      <div className="flex justify-center">
        <div
          className={`pointer-events-auto w-full transition-all duration-200 ${
            isFocused ? 'max-w-3xl' : 'max-w-2xl'
          }`}
          style={{ marginLeft: `${sidebarWidth}px`, paddingRight: `${sidebarWidth}px` }}
        >
          {/* Quick Analysis popover — only visible when focused */}
          {isFocused && (
            <div className="mx-4 mb-2 bg-white rounded-2xl border border-ink-200 shadow-ai overflow-hidden">
              <div className="px-4 pt-3 pb-1.5 border-b border-ink-100">
                <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Quick Analysis</p>
              </div>
              <div className="max-h-[320px] overflow-y-auto scrollbar-thin">
                {QUICK_ANALYSIS.map((cat) => (
                  <div key={cat.name} className="py-1.5">
                    <div className="px-4 py-1">
                      <p className="text-[11px] font-semibold text-ink-400 uppercase tracking-wider">{cat.name}</p>
                    </div>
                    {cat.items.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => handleSuggestionClick(item)}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-left hover:bg-edenred-50 transition-colors group"
                      >
                        <Sparkles size={14} className="text-edenred-500 flex-shrink-0 group-hover:text-edenred-600" />
                        <span className="flex-1 text-sm text-ink-700 font-medium">{item.label}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Context indicator */}
          {context && (
            <div className="mx-4 mb-1.5 flex items-center gap-2">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-edenred-50 text-edenred-700 text-xs font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-edenred-500 animate-pulse-soft" />
                {context}
                <button onClick={onClearContext} className="ml-0.5 hover:text-edenred-900 text-edenred-500">
                  ×
                </button>
              </div>
            </div>
          )}

          {/* AI Bar */}
          <div className="m-4 mb-5">
            <div
              className={`bg-white rounded-2xl border shadow-ai transition-all duration-200 ${
                isFocused ? 'border-edenred-400 ring-2 ring-edenred-500/10' : 'border-ink-200 shadow-soft'
              }`}
            >
              <div className="flex items-end gap-2 p-2.5">
                <div className="w-9 h-9 rounded-xl bg-edenred-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles size={18} className="text-white" />
                </div>
                <textarea
                  ref={inputRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => onFocus()}
                  onBlur={() => { setTimeout(() => onBlur(), 150); }}
                  rows={1}
                  placeholder="Ask about your fleet, generate a report, or start a workflow…"
                  className="flex-1 resize-none bg-transparent text-sm text-ink-800 placeholder:text-ink-400 focus:outline-none py-2 px-1 max-h-32 scrollbar-thin"
                  style={{ minHeight: '36px' }}
                />
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {!isFocused && (
                    <kbd className="hidden md:flex items-center gap-0.5 px-1.5 py-1 rounded-md bg-ink-100 text-ink-400 text-xs font-mono">
                      <Command size={11} />K
                    </kbd>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={!value.trim()}
                    className="w-9 h-9 rounded-xl bg-edenred-600 text-white flex items-center justify-center hover:bg-edenred-700 active:bg-edenred-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ArrowUp size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
