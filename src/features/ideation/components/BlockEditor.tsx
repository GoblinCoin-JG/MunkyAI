import { FileText, Trash2, X } from 'lucide-react';
import { useState } from 'react';
import { MATURITY_COLORS } from '../constants';
import { ArtifactBody, MaturityState, ThinkingBlock } from '../types';
import { artifactBodyHasContent } from '../utils/artifactBody.ts';

interface BlockEditorProps {
  selectedBlock: ThinkingBlock;
  onUpdateBlock: (id: string, updates: Partial<ThinkingBlock>) => void;
  onRequestDelete: (id: string) => void;
}

function parseListInput(value: string): string[] {
  return value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function ArtifactListSection({
  title,
  items,
  placeholder,
}: {
  title: string;
  items: string[];
  placeholder: string;
}) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4 space-y-3">
      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">{title}</h3>
      </div>
      {items.length > 0 ? (
        <ul className="space-y-2 text-sm text-zinc-200 list-disc pl-4">
          {items.map((item) => (
            <li key={`${title}-${item}`}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-zinc-500">{placeholder}</p>
      )}
    </section>
  );
}

export function BlockEditor({ selectedBlock, onUpdateBlock, onRequestDelete }: BlockEditorProps) {
  const [contentMode, setContentMode] = useState<'view' | 'edit'>('view');

  const updateArtifactBody = (patch: Partial<ArtifactBody>) => {
    onUpdateBlock(selectedBlock.id, {
      artifactBody: {
        ...selectedBlock.artifactBody,
        ...patch,
      },
    });
  };

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
              <div className="p-4 space-y-4">
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-2">
                  <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">Summary</label>
                  <textarea
                    value={selectedBlock.artifactBody.summary}
                    onChange={(event) => updateArtifactBody({ summary: event.target.value })}
                    placeholder="Capture what this block currently means in 1-3 concise sentences."
                    className="w-full min-h-28 bg-zinc-950/60 border border-zinc-800 rounded-lg p-4 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none resize-y"
                  />
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">Key Points</label>
                    <p className="text-[11px] text-zinc-500">One item per line.</p>
                    <textarea
                      value={selectedBlock.artifactBody.keyPoints.join('\n')}
                      onChange={(event) => updateArtifactBody({ keyPoints: parseListInput(event.target.value) })}
                      placeholder="Important facts, constraints, and decisions."
                      className="w-full min-h-52 bg-zinc-950/60 border border-zinc-800 rounded-lg p-4 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none resize-y"
                    />
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">Open Questions</label>
                    <p className="text-[11px] text-zinc-500">One unresolved question per line.</p>
                    <textarea
                      value={selectedBlock.artifactBody.openQuestions.join('\n')}
                      onChange={(event) => updateArtifactBody({ openQuestions: parseListInput(event.target.value) })}
                      placeholder="Unknowns, assumptions to test, or decisions still pending."
                      className="w-full min-h-52 bg-zinc-950/60 border border-zinc-800 rounded-lg p-4 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none resize-y"
                    />
                  </div>

                  <div className="rounded-xl border border-zinc-800 bg-zinc-950/40 p-4 space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">Next Moves</label>
                    <p className="text-[11px] text-zinc-500">One action per line.</p>
                    <textarea
                      value={selectedBlock.artifactBody.nextMoves.join('\n')}
                      onChange={(event) => updateArtifactBody({ nextMoves: parseListInput(event.target.value) })}
                      placeholder="Concrete follow-up steps for this block."
                      className="w-full min-h-52 bg-zinc-950/60 border border-zinc-800 rounded-lg p-4 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none resize-y"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 min-h-[340px]">
                {artifactBodyHasContent(selectedBlock.artifactBody) ? (
                  <div className="space-y-4">
                    <section className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-5 space-y-3">
                      <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-400">Summary</h3>
                      {selectedBlock.artifactBody.summary ? (
                        <p className="text-sm leading-7 text-zinc-200 whitespace-pre-wrap">{selectedBlock.artifactBody.summary}</p>
                      ) : (
                        <p className="text-sm text-zinc-500">No summary captured yet.</p>
                      )}
                    </section>

                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                      <ArtifactListSection
                        title="Key Points"
                        items={selectedBlock.artifactBody.keyPoints}
                        placeholder="No key points captured yet."
                      />
                      <ArtifactListSection
                        title="Open Questions"
                        items={selectedBlock.artifactBody.openQuestions}
                        placeholder="No open questions captured yet."
                      />
                      <ArtifactListSection
                        title="Next Moves"
                        items={selectedBlock.artifactBody.nextMoves}
                        placeholder="No next moves captured yet."
                      />
                    </div>
                  </div>
                ) : (
                  <p className="text-zinc-500">No artifact content yet. Switch to Edit mode to shape this block into a working artifact.</p>
                )}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
