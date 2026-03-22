import { FileText, MessageSquare, Plus, Save, Sparkles, X, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AiOutput, Suggestion } from '../types';

interface RightSidebarProps {
  rightWidth: number;
  selectedId: string | null;
  isAiLoading: boolean;
  aiOutput: AiOutput | null;
  onSetAiOutput: (output: AiOutput | null) => void;
  onAiAction: (action: 'expand' | 'clarify' | 'suggest' | 'artifact') => void;
  onApplyExpansion: () => void;
  onAddSuggestedBlock: (suggestion: Suggestion) => void;
}

export function RightSidebar({
  rightWidth,
  selectedId,
  isAiLoading,
  aiOutput,
  onSetAiOutput,
  onAiAction,
  onApplyExpansion,
  onAddSuggestedBlock,
}: RightSidebarProps) {
  return (
    <aside className="border-l border-zinc-800 flex flex-col bg-zinc-900/50 shrink-0" style={{ width: rightWidth }}>
      <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
        <Sparkles size={18} className="text-blue-400" />
        <h2 className="font-bold text-sm tracking-tight">AI ASSISTANT</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onAiAction('expand')}
            disabled={isAiLoading || !selectedId}
            className="flex flex-col items-center justify-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg transition-all border border-zinc-700/50"
          >
            <Zap size={16} className="text-yellow-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Expand</span>
          </button>
          <button
            onClick={() => onAiAction('clarify')}
            disabled={isAiLoading || !selectedId}
            className="flex flex-col items-center justify-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg transition-all border border-zinc-700/50"
          >
            <MessageSquare size={16} className="text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Clarify</span>
          </button>
          <button
            onClick={() => onAiAction('suggest')}
            disabled={isAiLoading || !selectedId}
            className="flex flex-col items-center justify-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg transition-all border border-zinc-700/50"
          >
            <Plus size={16} className="text-green-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Suggest</span>
          </button>
          <button
            onClick={() => onAiAction('artifact')}
            disabled={isAiLoading || !selectedId}
            className="flex flex-col items-center justify-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg transition-all border border-zinc-700/50"
          >
            <FileText size={16} className="text-purple-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Artifact</span>
          </button>
        </div>

        {isAiLoading && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
              <Sparkles size={24} className="text-blue-400" />
            </motion.div>
            <p className="text-xs text-zinc-500 animate-pulse">Thinking...</p>
          </div>
        )}

        <AnimatePresence mode="wait">
          {aiOutput && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">AI Result</span>
                <button onClick={() => onSetAiOutput(null)} className="text-zinc-500 hover:text-white">
                  <X size={14} />
                </button>
              </div>

              {aiOutput.type === 'expand' && (
                <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 space-y-3">
                  <p className="text-xs text-zinc-300 leading-relaxed italic">&quot;{aiOutput.content.summary}&quot;</p>
                  <button
                    onClick={onApplyExpansion}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-md transition-colors flex items-center justify-center gap-2"
                  >
                    <Save size={14} /> Apply Expansion
                  </button>
                </div>
              )}

              {aiOutput.type === 'clarify' && (
                <div className="space-y-2">
                  {aiOutput.content.map((question, index) => (
                    <div key={index} className="bg-zinc-800/50 border border-zinc-800 p-3 rounded-lg text-xs leading-relaxed text-zinc-300">
                      {question}
                    </div>
                  ))}
                </div>
              )}

              {aiOutput.type === 'suggest' && (
                <div className="space-y-2">
                  {aiOutput.content.map((suggestion, index) => (
                    <div key={index} className="bg-zinc-800/50 border border-zinc-800 p-3 rounded-lg space-y-2">
                      <h4 className="text-xs font-bold text-green-400">{suggestion.title}</h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{suggestion.description}</p>
                      <button
                        onClick={() => onAddSuggestedBlock(suggestion)}
                        className="text-[10px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1"
                      >
                        <Plus size={12} /> Add to Tree
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-auto p-4 border-t border-zinc-800">
        <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-800">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Quick Tips</h4>
          <ul className="text-[10px] text-zinc-400 space-y-1.5 list-disc pl-3">
            <li>Use <strong>Expand</strong> to flesh out thin ideas.</li>
            <li>
              <strong>Suggest</strong> helps overcome writer&apos;s block.
            </li>
            <li>
              <strong>Artifact</strong> creates a shareable summary.
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
