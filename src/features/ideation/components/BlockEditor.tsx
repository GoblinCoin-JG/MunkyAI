import { FileText, Trash2, X } from 'lucide-react';
import { MATURITY_COLORS } from '../constants';
import { MaturityState, ThinkingBlock } from '../types';
import { ArtifactPreview } from './ArtifactPreview';

interface BlockEditorProps {
  selectedBlock: ThinkingBlock;
  artifactDraft: string | null;
  onUpdateBlock: (id: string, updates: Partial<ThinkingBlock>) => void;
  onRequestDelete: (id: string) => void;
  onExportArtifact: (title: string) => void;
  onCloseArtifact: () => void;
}

export function BlockEditor({
  selectedBlock,
  artifactDraft,
  onUpdateBlock,
  onRequestDelete,
  onExportArtifact,
  onCloseArtifact,
}: BlockEditorProps) {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/20">
        <div className="flex items-center gap-3">
          <FileText size={18} className="text-zinc-500" />
          <input
            type="text"
            value={selectedBlock.title}
            onChange={(event) => onUpdateBlock(selectedBlock.id, { title: event.target.value })}
            className="bg-transparent border-none text-lg font-medium focus:ring-0 outline-none w-64"
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

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-3xl mx-auto space-y-8">
          <section>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Summary</label>
            <textarea
              value={selectedBlock.summary}
              onChange={(event) => onUpdateBlock(selectedBlock.id, { summary: event.target.value })}
              placeholder="A brief overview of this thinking block..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none min-h-[80px] resize-none"
            />
          </section>

          <section>
            <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Notes & Content</label>
            <textarea
              value={selectedBlock.content}
              onChange={(event) => onUpdateBlock(selectedBlock.id, { content: event.target.value })}
              placeholder="Detailed thoughts, data, and exploration..."
              className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none min-h-[300px] resize-y"
            />
          </section>

          <div className="grid grid-cols-2 gap-8">
            <section>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Maturity State</label>
              <select
                value={selectedBlock.maturityState}
                onChange={(event) => onUpdateBlock(selectedBlock.id, { maturityState: event.target.value as MaturityState })}
                className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-sm focus:border-blue-500/50 outline-none appearance-none"
              >
                <option value="Exploratory">Exploratory</option>
                <option value="Developing">Developing</option>
                <option value="Validated">Validated</option>
                <option value="Locked">Locked</option>
              </select>
            </section>

            <section>
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
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
                  className="bg-transparent border-none text-xs focus:ring-0 outline-none w-20"
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
            </section>
          </div>

          {artifactDraft && (
            <ArtifactPreview
              artifactDraft={artifactDraft}
              title={selectedBlock.title}
              onExport={onExportArtifact}
              onClose={onCloseArtifact}
            />
          )}
        </div>
      </div>
    </div>
  );
}
