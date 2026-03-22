import { Sparkles, X, Zap } from 'lucide-react';
import { motion } from 'motion/react';

interface NewProjectModalProps {
  isOpen: boolean;
  isAiLoading: boolean;
  newProjectIdea: string;
  onClose: () => void;
  onChangeIdea: (value: string) => void;
  onCreateProject: () => void;
}

export function NewProjectModal({
  isOpen,
  isAiLoading,
  newProjectIdea,
  onClose,
  onChangeIdea,
  onCreateProject,
}: NewProjectModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 max-w-lg w-full shadow-2xl space-y-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Sparkles size={24} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Start New Project</h2>
              <p className="text-xs text-zinc-500">Explain your idea and AI will scaffold it.</p>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">Your Idea</label>
          <textarea
            value={newProjectIdea}
            onChange={(event) => onChangeIdea(event.target.value)}
            placeholder="e.g., A mobile app for local gardeners to swap seeds and tools..."
            className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none min-h-[120px] resize-none"
            autoFocus
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-sm font-bold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onCreateProject}
            disabled={isAiLoading || !newProjectIdea.trim()}
            className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {isAiLoading ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                  <Sparkles size={16} />
                </motion.div>
                Analyzing...
              </>
            ) : (
              <>
                <Zap size={16} /> Generate Project
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
