import { Wand2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo } from 'react';
import { ExpandAspectCard, ExpandBoard } from '../../types';

interface ExpandBoardModalProps {
  isOpen: boolean;
  selectedId: string | null;
  isAiLoading: boolean;
  isSubmittingExpandBoard: boolean;
  expandBoard: ExpandBoard | null;
  expandBoardError: string | null;
  expandBoardIncompleteIds: string[];
  expandBoardCompletion: number;
  onClose: () => void;
  onSetExpandCardDetail: (cardId: string, detail: string) => void;
  onSetExpandCardContext: (cardId: string, context: string) => void;
  onDeleteExpandCard: (cardId: string) => void;
  onAddCustomExpandCard: () => void;
  onAddAiExpandCard: () => void;
  onSubmitExpandBoard: () => Promise<boolean>;
}

function ExpandCardView({
  card,
  onSetExpandCardDetail,
  onSetExpandCardContext,
  onDeleteExpandCard,
}: {
  card: ExpandAspectCard;
  onSetExpandCardDetail: (cardId: string, detail: string) => void;
  onSetExpandCardContext: (cardId: string, context: string) => void;
  onDeleteExpandCard: (cardId: string) => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold tracking-tight text-zinc-100">{card.title}</h4>
            <span className="rounded border border-zinc-700 px-1.5 py-0.5 text-[9px] uppercase tracking-widest text-zinc-400">
              {card.source}
            </span>
          </div>
        </div>
        <button
          onClick={() => onDeleteExpandCard(card.id)}
          className="rounded border border-zinc-700 bg-zinc-800/80 px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-300 hover:bg-zinc-700"
        >
          Remove
        </button>
      </div>

      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-wider text-zinc-500">Detail</p>
        <textarea
          value={card.detail}
          onChange={(event) => onSetExpandCardDetail(card.id, event.target.value)}
          placeholder="Describe this expansion detail"
          className="w-full min-h-24 rounded-lg border border-zinc-700 bg-zinc-950/70 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-blue-500/50"
        />
      </div>

      <div className="space-y-1">
        <p className="text-[11px] uppercase tracking-wider text-zinc-500">Context</p>
        <textarea
          value={card.context}
          onChange={(event) => onSetExpandCardContext(card.id, event.target.value)}
          placeholder="Optional context, constraints, or edits for this aspect"
          className="w-full min-h-16 rounded-lg border border-zinc-800 bg-zinc-950/60 p-2.5 text-xs text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-blue-500/40"
        />
      </div>
    </div>
  );
}

export function ExpandBoardModal({
  isOpen,
  selectedId,
  isAiLoading,
  isSubmittingExpandBoard,
  expandBoard,
  expandBoardError,
  expandBoardIncompleteIds,
  expandBoardCompletion,
  onClose,
  onSetExpandCardDetail,
  onSetExpandCardContext,
  onDeleteExpandCard,
  onAddCustomExpandCard,
  onAddAiExpandCard,
  onSubmitExpandBoard,
}: ExpandBoardModalProps) {
  useEffect(() => {
    if (isOpen && !expandBoard && !isSubmittingExpandBoard) {
      onClose();
    }
  }, [isOpen, expandBoard, isSubmittingExpandBoard, onClose]);

  const hasBoardForSelection = Boolean(expandBoard && selectedId && expandBoard.blockId === selectedId);

  const unresolvedCount = expandBoardIncompleteIds.length;
  const canSubmit =
    hasBoardForSelection &&
    !isAiLoading &&
    !isSubmittingExpandBoard &&
    expandBoard !== null &&
    expandBoard.cards.length > 0 &&
    unresolvedCount === 0;

  const boardSummary = useMemo(() => {
    if (!hasBoardForSelection || !expandBoard) {
      return 'No active board';
    }

    return `${expandBoard.cards.length} cards`;
  }, [expandBoard, hasBoardForSelection]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 18, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 18, scale: 0.98 }}
        className="w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-zinc-800 p-4">
          <div>
            <h3 className="text-lg font-bold tracking-tight text-zinc-100">Expand Board</h3>
            <p className="text-xs text-zinc-400">{boardSummary}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-zinc-800 p-4 space-y-3 bg-zinc-950/50">
          <div className="h-2 rounded-full overflow-hidden bg-zinc-800">
            <motion.div
              className="h-full bg-blue-500"
              animate={{ width: `${expandBoardCompletion}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onAddCustomExpandCard}
              disabled={!selectedId}
              className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
            >
              + Custom Card
            </button>
            <button
              onClick={onAddAiExpandCard}
              disabled={isAiLoading || !selectedId}
              className="rounded-md border border-blue-500/30 bg-blue-500/10 px-3 py-2 text-xs text-blue-300 hover:bg-blue-500/20 disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-1">
                <Wand2 size={13} />
                + AI Card
              </span>
            </button>
            <div className="ml-auto rounded-md border border-zinc-800 bg-zinc-900 px-2.5 py-1.5 text-[11px] text-zinc-400">
              {unresolvedCount > 0
                ? `${unresolvedCount} cards still need detail`
                : 'All cards have detail'}
            </div>
            <button
              onClick={async () => {
                const submitted = await onSubmitExpandBoard();
                if (submitted) {
                  onClose();
                }
              }}
              disabled={!canSubmit}
              className="rounded-md bg-blue-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50 hover:bg-blue-500"
            >
              {isSubmittingExpandBoard ? 'Submitting...' : 'Submit Changes'}
            </button>
          </div>

          {expandBoardError && (
            <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-2.5 text-xs text-red-200">
              {expandBoardError}
            </div>
          )}
        </div>

        <div className="max-h-[58vh] overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {!selectedId && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-500">
              Select a block to use the expand board.
            </div>
          )}

          {selectedId && !hasBoardForSelection && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-500">
              Generate an expand board from the AI panel first.
            </div>
          )}

          {hasBoardForSelection && expandBoard && expandBoard.cards.length === 0 && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-500">
              No cards yet. Add a custom card or ask AI to add one.
            </div>
          )}

          {hasBoardForSelection &&
            expandBoard &&
            expandBoard.cards.length > 0 &&
            expandBoard.cards.map((card) => (
              <ExpandCardView
                key={card.id}
                card={card}
                onSetExpandCardDetail={onSetExpandCardDetail}
                onSetExpandCardContext={onSetExpandCardContext}
                onDeleteExpandCard={onDeleteExpandCard}
              />
            ))}
        </div>
      </motion.div>
    </div>
  );
}
