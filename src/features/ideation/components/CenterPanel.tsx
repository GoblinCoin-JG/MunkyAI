import { Layers } from 'lucide-react';
import { ThinkingBlock } from '../types';
import { BlockEditor } from './BlockEditor';

interface CenterPanelProps {
  selectedBlock: ThinkingBlock | null;
  onUpdateBlock: (id: string, updates: Partial<ThinkingBlock>) => void;
  onRequestDelete: (id: string) => void;
}

export function CenterPanel({
  selectedBlock,
  onUpdateBlock,
  onRequestDelete,
}: CenterPanelProps) {
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-zinc-950">
      {selectedBlock ? (
        <BlockEditor
          selectedBlock={selectedBlock}
          onUpdateBlock={onUpdateBlock}
          onRequestDelete={onRequestDelete}
        />
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
          <Layers size={48} className="mb-4 opacity-20" />
          <p>Select a block to start ideating</p>
        </div>
      )}
    </main>
  );
}
