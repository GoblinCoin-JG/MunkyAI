import { Layers } from 'lucide-react';
import { ThinkingBlock } from '../types';
import { BlockEditor } from './BlockEditor';

interface CenterPanelProps {
  selectedBlock: ThinkingBlock | null;
  artifactDraft: string | null;
  onUpdateBlock: (id: string, updates: Partial<ThinkingBlock>) => void;
  onRequestDelete: (id: string) => void;
  onExportArtifact: (title: string) => void;
  onCloseArtifact: () => void;
}

export function CenterPanel({
  selectedBlock,
  artifactDraft,
  onUpdateBlock,
  onRequestDelete,
  onExportArtifact,
  onCloseArtifact,
}: CenterPanelProps) {
  return (
    <main className="flex-1 flex flex-col min-w-0 bg-zinc-950">
      {selectedBlock ? (
        <BlockEditor
          selectedBlock={selectedBlock}
          artifactDraft={artifactDraft}
          onUpdateBlock={onUpdateBlock}
          onRequestDelete={onRequestDelete}
          onExportArtifact={onExportArtifact}
          onCloseArtifact={onCloseArtifact}
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
