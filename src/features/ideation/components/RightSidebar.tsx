import { Brain, MessageSquare, Plus, Sparkles, Trash2, X, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useMemo } from 'react';
import { AiOutput, ChallengeResult, ClarifyBoard, ExpandBoard, Suggestion } from '../types';
import { artifactBodyToPreviewText } from '../utils/artifactBody.ts';

interface RightSidebarProps {
  rightWidth: number;
  selectedId: string | null;
  isAiLoading: boolean;
  isSubmittingExpandBoard: boolean;
  isSubmittingClarifyBoard: boolean;
  aiOutput: AiOutput | null;
  expandBoard: ExpandBoard | null;
  expandBoardError: string | null;
  expandBoardIncompleteIds: string[];
  expandBoardCompletion: number;
  clarifyBoard: ClarifyBoard | null;
  clarifyBoardError: string | null;
  clarifyBoardUnansweredIds: string[];
  clarifyBoardCompletion: number;
  challengeResult: ChallengeResult | null;
  challengeError: string | null;
  challengeOpenCount: number;
  challengeAnsweredCount: number;
  onSetAiOutput: (output: AiOutput | null) => void;
  onAiAction: (action: 'expand' | 'clarify' | 'suggest' | 'challenge') => void;
  onOpenExpandBoard: () => void;
  onClearExpandBoard: () => void;
  onOpenQuestionBoard: () => void;
  onRequestDeleteQuestionBoard: () => void;
  onOpenChallengeModal: () => void;
  onClearChallenge: () => void;
  onAddSuggestedBlock: (suggestion: Suggestion) => void;
}

export function RightSidebar({
  rightWidth,
  selectedId,
  isAiLoading,
  isSubmittingExpandBoard,
  isSubmittingClarifyBoard,
  aiOutput,
  expandBoard,
  expandBoardError,
  expandBoardIncompleteIds,
  expandBoardCompletion,
  clarifyBoard,
  clarifyBoardError,
  clarifyBoardUnansweredIds,
  clarifyBoardCompletion,
  challengeResult,
  challengeError,
  challengeOpenCount,
  challengeAnsweredCount,
  onSetAiOutput,
  onAiAction,
  onOpenExpandBoard,
  onClearExpandBoard,
  onOpenQuestionBoard,
  onRequestDeleteQuestionBoard,
  onOpenChallengeModal,
  onClearChallenge,
  onAddSuggestedBlock,
}: RightSidebarProps) {
  const hasExpandBoardForSelection = Boolean(
    expandBoard && selectedId && expandBoard.blockId === selectedId,
  );

  const expandUnresolvedCount = expandBoardIncompleteIds.length;

  const expandBoardSummary = useMemo(() => {
    if (!hasExpandBoardForSelection || !expandBoard) {
      return 'No active board';
    }

    return `${expandBoard.cards.length} cards`;
  }, [expandBoard, hasExpandBoardForSelection]);

  const hasBoardForSelection = Boolean(
    clarifyBoard && selectedId && clarifyBoard.blockId === selectedId,
  );

  const unresolvedCount = clarifyBoardUnansweredIds.length;

  const boardSummary = useMemo(() => {
    if (!hasBoardForSelection || !clarifyBoard) {
      return 'No active board';
    }

    return `${clarifyBoard.cards.length} cards`;
  }, [clarifyBoard, hasBoardForSelection]);

  const challengeSummary = useMemo(() => {
    if (!challengeResult) {
      return 'No challenge set';
    }

    return `${challengeResult.items.length} items`;
  }, [challengeResult]);

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
            <span className="text-[10px] font-bold uppercase tracking-wider">Question Board</span>
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
            onClick={() => onAiAction('challenge')}
            disabled={isAiLoading || !selectedId}
            className="flex flex-col items-center justify-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg transition-all border border-zinc-700/50"
          >
            <Brain size={16} className="text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Challenge</span>
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

              {aiOutput.type === 'suggest' && (
                <div className="space-y-2">
                  {aiOutput.content.map((suggestion, index) => (
                    <div key={index} className="bg-zinc-800/50 border border-zinc-800 p-3 rounded-lg space-y-2">
                      <h4 className="text-xs font-bold text-green-400">{suggestion.title}</h4>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {suggestion.artifactBody.summary || artifactBodyToPreviewText(suggestion.artifactBody) || 'No summary generated.'}
                      </p>
                      {suggestion.artifactBody.keyPoints.length > 0 && (
                        <ul className="list-disc pl-4 text-[11px] text-zinc-500 space-y-1">
                          {suggestion.artifactBody.keyPoints.slice(0, 2).map((item) => (
                            <li key={`${suggestion.title}-${item}`}>{item}</li>
                          ))}
                        </ul>
                      )}
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

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40">
          <div className="border-b border-zinc-800 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Expand Board</span>
              <span className="text-[10px] text-zinc-500">{expandBoardSummary}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-zinc-800">
              <motion.div
                className="h-full bg-blue-500"
                animate={{ width: `${expandBoardCompletion}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>

          <div className="p-3 space-y-3">
            {!selectedId && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-500">
                Select a block to generate or edit an expand board.
              </div>
            )}

            {selectedId && !hasExpandBoardForSelection && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-500">
                Run Expand to generate cards for this block, then open the board window.
              </div>
            )}

            {hasExpandBoardForSelection && expandBoard && (
              <>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-2.5 text-[11px] text-zinc-400">
                  {expandUnresolvedCount > 0
                    ? `${expandUnresolvedCount} cards still need detail before submit.`
                    : 'All cards detailed. Ready to submit from the board window.'}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onOpenExpandBoard}
                    className="flex-1 rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-2 text-[11px] font-semibold text-blue-200 hover:bg-blue-500/20"
                  >
                    Open Board Window
                  </button>
                  <button
                    onClick={onClearExpandBoard}
                    className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-2 text-[11px] text-red-300 hover:bg-red-500/20"
                  >
                    <span className="inline-flex items-center gap-1"><Trash2 size={12} /> Delete</span>
                  </button>
                </div>

                {expandBoardError && (
                  <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-2.5 text-xs text-red-200">
                    {expandBoardError}
                  </div>
                )}
                {isSubmittingExpandBoard && (
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-2.5 text-xs text-blue-200">
                    Submitting expansion cards...
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40">
          <div className="border-b border-zinc-800 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Question Board</span>
              <span className="text-[10px] text-zinc-500">{boardSummary}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden bg-zinc-800">
              <motion.div
                className="h-full bg-blue-500"
                animate={{ width: `${clarifyBoardCompletion}%` }}
                transition={{ duration: 0.2 }}
              />
            </div>
          </div>

          <div className="p-3 space-y-3">
            {!selectedId && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-500">
                Select a block to generate or edit a question board.
              </div>
            )}

            {selectedId && !hasBoardForSelection && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-500">
                Run Question Board to generate cards for this block. When available, you can open it in the center window.
              </div>
            )}

            {hasBoardForSelection && clarifyBoard && (
              <>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-2.5 text-[11px] text-zinc-400">
                  {unresolvedCount > 0
                    ? `${unresolvedCount} cards still need an answer before submit.`
                    : 'All cards answered. Ready to submit from the board window.'}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={onOpenQuestionBoard}
                    className="flex-1 rounded-md border border-blue-500/30 bg-blue-500/10 px-2 py-2 text-[11px] font-semibold text-blue-200 hover:bg-blue-500/20"
                  >
                    Open Board Window
                  </button>
                  <button
                    onClick={onRequestDeleteQuestionBoard}
                    className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-2 text-[11px] text-red-300 hover:bg-red-500/20"
                  >
                    <span className="inline-flex items-center gap-1"><Trash2 size={12} /> Delete</span>
                  </button>
                </div>
                {clarifyBoardError && (
                  <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-2.5 text-xs text-red-200">
                    {clarifyBoardError}
                  </div>
                )}
                {isSubmittingClarifyBoard && (
                  <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-2.5 text-xs text-blue-200">
                    Submitting board answers...
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-950/40">
          <div className="border-b border-zinc-800 p-3 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Challenge</span>
            <span className="text-[10px] text-zinc-500">{challengeSummary}</span>
          </div>
          <div className="p-3 space-y-3">
            {!challengeResult && (
              <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-500">
                Run Challenge to generate a structured critique for this block.
              </div>
            )}

            {challengeResult && (
              <>
                <div className="rounded-lg border border-zinc-800 bg-zinc-900/70 p-2.5 text-[11px] text-zinc-400">
                  {challengeAnsweredCount} answered or resolved, {challengeOpenCount} still open.
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={onOpenChallengeModal}
                    className="flex-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-2 text-[11px] font-semibold text-amber-200 hover:bg-amber-500/20"
                  >
                    Open Challenge
                  </button>
                  <button
                    onClick={onClearChallenge}
                    className="rounded-md border border-red-500/30 bg-red-500/10 px-2 py-2 text-[11px] text-red-300 hover:bg-red-500/20"
                  >
                    <span className="inline-flex items-center gap-1"><Trash2 size={12} /> Clear</span>
                  </button>
                </div>
              </>
            )}

            {challengeError && (
              <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-2.5 text-xs text-red-200">
                {challengeError}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-auto p-4 border-t border-zinc-800">
        <div className="bg-zinc-800/30 rounded-lg p-3 border border-zinc-800">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Quick Tips</h4>
          <ul className="text-[10px] text-zinc-400 space-y-1.5 list-disc pl-3">
            <li>Use <strong>Expand</strong> to build card-based detail before updating.</li>
            <li>
              <strong>Suggest</strong> helps overcome writer&apos;s block.
            </li>
            <li>
              <strong>Challenge</strong> pressure-tests assumptions and missing decisions.
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
