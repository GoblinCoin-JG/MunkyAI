import { Download, X } from 'lucide-react';
import { motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';

interface ArtifactPreviewProps {
  artifactDraft: string;
  title: string;
  onExport: (title: string) => void;
  onClose: () => void;
}

export function ArtifactPreview({ artifactDraft, title, onExport, onClose }: ArtifactPreviewProps) {
  return (
    <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 border-t border-zinc-800 pt-8">
      <div className="flex items-center justify-between mb-4">
        <label className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Artifact Preview (Generated)</label>
        <div className="flex gap-2">
          <button
            onClick={() => onExport(title)}
            className="flex items-center gap-2 text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md transition-colors"
          >
            <Download size={14} /> Export MD
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500">
            <X size={16} />
          </button>
        </div>
      </div>
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-8 prose prose-invert prose-sm max-w-none">
        <ReactMarkdown>{artifactDraft}</ReactMarkdown>
      </div>
    </motion.section>
  );
}
