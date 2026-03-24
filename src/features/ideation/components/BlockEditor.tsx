import { FileText, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { MATURITY_COLORS } from '../constants';
import { MaturityState, ThinkingBlock } from '../types';
import { artifactBodyHasContent, normalizeArtifactBodyToMarkdown } from '../utils/artifactBody.ts';

interface BlockEditorProps {
  selectedBlock: ThinkingBlock;
  onUpdateBlock: (id: string, updates: Partial<ThinkingBlock>) => void;
  onRequestDelete: (id: string) => void;
}

export function BlockEditor({ selectedBlock, onUpdateBlock, onRequestDelete }: BlockEditorProps) {
  const [contentMode, setContentMode] = useState<'view' | 'edit'>('view');

  const artifactMarkdown = normalizeArtifactBodyToMarkdown(selectedBlock.artifactBody);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/20">
        <div className="flex items-center gap-3 min-w-0">
          <FileText size={18} className="text-zinc-500 shrink-0" />
          <input
            type="text"
            value={selectedBlock.title}
            onChange={(event) => onUpdateBlock(selectedBlock.id, { title: event.target.value })}
            className="bg-transparent border-none text-lg font-medium focus:ring-0 outline-none w-full max-w-xl"
          />
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-wider ${MATURITY_COLORS[selectedBlock.maturityState]}`}
          >
            {selectedBlock.maturityState}
          </span>
          <button
            onClick={() => onRequestDelete(selectedBlock.id)}
            className="p-2 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-red-400 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-5">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Maturity State</label>
              <select
                value={selectedBlock.maturityState}
                onChange={(event) => onUpdateBlock(selectedBlock.id, { maturityState: event.target.value as MaturityState })}
                className="w-full bg-zinc-950/60 border border-zinc-800 rounded-lg p-2.5 text-sm focus:border-blue-500/50 outline-none appearance-none"
              >
                <option value="Exploratory">Exploratory</option>
                <option value="Developing">Developing</option>
                <option value="Validated">Validated</option>
                <option value="Locked">Locked</option>
              </select>
            </div>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-3">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2 items-center">
                {selectedBlock.tags.map((tag) => (
                  <span key={tag} className="flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded">
                    {tag}
                    <button onClick={() => onUpdateBlock(selectedBlock.id, { tags: selectedBlock.tags.filter((value) => value !== tag) })}>
                      <X size={10} />
                    </button>
                  </span>
                ))}

                <input
                  type="text"
                  placeholder="+ Add tag"
                  className="bg-transparent border-none text-xs focus:ring-0 outline-none w-24"
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter') {
                      return;
                    }

                    const value = event.currentTarget.value.trim();
                    if (value && !selectedBlock.tags.includes(value)) {
                      onUpdateBlock(selectedBlock.id, { tags: [...selectedBlock.tags, value] });
                      event.currentTarget.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden">
            <div className="border-b border-zinc-800 p-3 flex items-center justify-between gap-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Artifact</label>
              <div className="inline-flex rounded-lg border border-zinc-700 bg-zinc-900/70 p-1">
                <button
                  onClick={() => setContentMode('view')}
                  className={`px-3 py-1 text-xs rounded-md ${contentMode === 'view' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  View
                </button>
                <button
                  onClick={() => setContentMode('edit')}
                  className={`px-3 py-1 text-xs rounded-md ${contentMode === 'edit' ? 'bg-zinc-700 text-zinc-100' : 'text-zinc-400 hover:text-zinc-200'}`}
                >
                  Edit
                </button>
              </div>
            </div>

            {contentMode === 'edit' ? (
              <div className="p-4 space-y-2">
                <p className="text-[11px] text-zinc-500">
                  Markdown-first artifact: use headings, bullets, and short paragraphs as needed. Keep it scan-friendly.
                </p>
                <textarea
                  value={artifactMarkdown}
                  onChange={(event) => onUpdateBlock(selectedBlock.id, { artifactBody: event.target.value })}
                  placeholder="Start writing a living artifact in markdown..."
                  className="w-full min-h-[380px] bg-zinc-950/60 border border-zinc-800 rounded-lg p-4 text-sm leading-7 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none resize-y"
                />
              </div>
            ) : (
              <div className="p-6 min-h-[340px]">
                {artifactBodyHasContent(artifactMarkdown) ? (
                  <article className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-5">
                    <div className="space-y-4 text-zinc-200 leading-7 [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:text-zinc-100 [&_h1]:mt-6 [&_h1]:first:mt-0 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-zinc-100 [&_h2]:mt-5 [&_h2]:first:mt-0 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-zinc-100 [&_h3]:mt-4 [&_p]:text-sm [&_p]:text-zinc-200 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:text-sm [&_li]:text-zinc-200 [&_code]:rounded [&_code]:bg-zinc-800 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs">
                      <ReactMarkdown>{artifactMarkdown}</ReactMarkdown>
                    </div>
                  </article>
                ) : (
                  <p className="text-zinc-500">No artifact content yet. Switch to Edit mode to shape this block into a working markdown document.</p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
