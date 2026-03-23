import { CheckCircle2, Circle, Wand2, X } from 'lucide-react';
import { motion } from 'motion/react';
import { useEffect, useMemo, useState } from 'react';
import { ClarifyBoard, ClarifyQuestionCard } from '../../types';

interface QuestionBoardModalProps {
  isOpen: boolean;
  selectedId: string | null;
  isAiLoading: boolean;
  isSubmittingClarifyBoard: boolean;
  clarifyBoard: ClarifyBoard | null;
  clarifyBoardError: string | null;
  clarifyBoardUnansweredIds: string[];
  clarifyBoardCompletion: number;
  onClose: () => void;
  onSetQuestionCardAnswer: (cardId: string, answer: string | string[]) => void;
  onSetQuestionCardNote: (cardId: string, note: string) => void;
  onAddQuestionOption: (cardId: string, option: string) => void;
  onDeleteQuestionCard: (cardId: string) => void;
  onAddCustomQuestionCard: () => void;
  onAddAiQuestionCard: () => void;
  onSubmitQuestionBoard: () => void;
}

function QuestionCardView({
  card,
  optionDraft,
  onSetOptionDraft,
  onSetQuestionCardAnswer,
  onSetQuestionCardNote,
  onAddQuestionOption,
  onDeleteQuestionCard,
}: {
  card: ClarifyQuestionCard;
  optionDraft: string;
  onSetOptionDraft: (value: string) => void;
  onSetQuestionCardAnswer: (cardId: string, answer: string | string[]) => void;
  onSetQuestionCardNote: (cardId: string, note: string) => void;
  onAddQuestionOption: (cardId: string, option: string) => void;
  onDeleteQuestionCard: (cardId: string) => void;
}) {
  const multiAnswer = card.type === 'multi' && Array.isArray(card.answer) ? card.answer : [];
  const singleAnswer = typeof card.answer === 'string' ? card.answer : '';

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
          <p className="mt-1 text-xs leading-5 text-zinc-400">{card.prompt}</p>
        </div>
        <button
          onClick={() => onDeleteQuestionCard(card.id)}
          className="rounded border border-zinc-700 bg-zinc-800/80 px-2 py-1 text-[10px] uppercase tracking-wider text-zinc-300 hover:bg-zinc-700"
        >
          Remove
        </button>
      </div>

      {card.type === 'textarea' && (
        <textarea
          value={singleAnswer}
          onChange={(event) => onSetQuestionCardAnswer(card.id, event.target.value)}
          placeholder="Write your answer..."
          className="w-full min-h-24 rounded-lg border border-zinc-700 bg-zinc-950/70 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-blue-500/50"
        />
      )}

      {(card.type === 'single' || card.type === 'multi') && (
        <div className="space-y-2">
          {card.options.map((option) => {
            const isActive = card.type === 'single' ? singleAnswer === option : multiAnswer.includes(option);

            return (
              <button
                key={option}
                onClick={() => {
                  if (card.type === 'single') {
                    onSetQuestionCardAnswer(card.id, option);
                    return;
                  }

                  const next = isActive
                    ? multiAnswer.filter((item) => item !== option)
                    : [...multiAnswer, option];
                  onSetQuestionCardAnswer(card.id, next);
                }}
                className={`w-full rounded-lg border p-2.5 text-left text-xs transition-colors flex items-center gap-2 ${
                  isActive
                    ? 'border-blue-400/30 bg-blue-400/10 text-blue-300'
                    : 'border-zinc-800 bg-zinc-950/50 text-zinc-300 hover:bg-zinc-800/80'
                }`}
              >
                {isActive ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                <span>{option}</span>
              </button>
            );
          })}

          <div className="flex items-center gap-2">
            <input
              value={optionDraft}
              onChange={(event) => onSetOptionDraft(event.target.value)}
              placeholder="Add option"
              className="flex-1 rounded-md border border-zinc-700 bg-zinc-950/70 px-2 py-1.5 text-xs text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-blue-500/50"
            />
            <button
              onClick={() => {
                onAddQuestionOption(card.id, optionDraft);
                onSetOptionDraft('');
              }}
              className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1.5 text-[11px] text-zinc-200 hover:bg-zinc-700"
            >
              Add
            </button>
          </div>
        </div>
      )}

      <textarea
        value={card.note}
        onChange={(event) => onSetQuestionCardNote(card.id, event.target.value)}
        placeholder="Optional note or context for this card"
        className="w-full min-h-16 rounded-lg border border-zinc-800 bg-zinc-950/60 p-2.5 text-xs text-zinc-200 placeholder:text-zinc-500 outline-none focus:border-blue-500/40"
      />
    </div>
  );
}

export function QuestionBoardModal({
  isOpen,
  selectedId,
  isAiLoading,
  isSubmittingClarifyBoard,
  clarifyBoard,
  clarifyBoardError,
  clarifyBoardUnansweredIds,
  clarifyBoardCompletion,
  onClose,
  onSetQuestionCardAnswer,
  onSetQuestionCardNote,
  onAddQuestionOption,
  onDeleteQuestionCard,
  onAddCustomQuestionCard,
  onAddAiQuestionCard,
  onSubmitQuestionBoard,
}: QuestionBoardModalProps) {
  const [optionDrafts, setOptionDrafts] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && !clarifyBoard && !isSubmittingClarifyBoard) {
      onClose();
    }
  }, [isOpen, clarifyBoard, isSubmittingClarifyBoard, onClose]);

  const hasBoardForSelection = Boolean(
    clarifyBoard && selectedId && clarifyBoard.blockId === selectedId,
  );

  const unresolvedCount = clarifyBoardUnansweredIds.length;
  const canSubmit =
    hasBoardForSelection &&
    !isAiLoading &&
    !isSubmittingClarifyBoard &&
    clarifyBoard !== null &&
    clarifyBoard.cards.length > 0 &&
    unresolvedCount === 0;

  const boardSummary = useMemo(() => {
    if (!hasBoardForSelection || !clarifyBoard) {
      return 'No active board';
    }

    return `${clarifyBoard.cards.length} cards`;
  }, [clarifyBoard, hasBoardForSelection]);

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
            <h3 className="text-lg font-bold tracking-tight text-zinc-100">Question Board</h3>
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
              animate={{ width: `${clarifyBoardCompletion}%` }}
              transition={{ duration: 0.2 }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onAddCustomQuestionCard}
              disabled={!selectedId}
              className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-700 disabled:opacity-50"
            >
              + Custom Card
            </button>
            <button
              onClick={onAddAiQuestionCard}
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
                ? `${unresolvedCount} cards still need an answer`
                : 'All cards answered'}
            </div>
            <button
              onClick={onSubmitQuestionBoard}
              disabled={!canSubmit}
              className="rounded-md bg-blue-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50 hover:bg-blue-500"
            >
              {isSubmittingClarifyBoard ? 'Submitting...' : 'Submit Answers'}
            </button>
          </div>

          {clarifyBoardError && (
            <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-2.5 text-xs text-red-200">
              {clarifyBoardError}
            </div>
          )}
        </div>

        <div className="max-h-[58vh] overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {!selectedId && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-500">
              Select a block to use the question board.
            </div>
          )}

          {selectedId && !hasBoardForSelection && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-500">
              Generate a question board from the AI panel first.
            </div>
          )}

          {hasBoardForSelection && clarifyBoard && clarifyBoard.cards.length === 0 && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-500">
              No cards yet. Add a custom card or ask AI to add one.
            </div>
          )}

          {hasBoardForSelection && clarifyBoard && clarifyBoard.cards.length > 0 &&
            clarifyBoard.cards.map((card) => (
              <QuestionCardView
                key={card.id}
                card={card}
                optionDraft={optionDrafts[card.id] || ''}
                onSetOptionDraft={(value) =>
                  setOptionDrafts((prev) => ({
                    ...prev,
                    [card.id]: value,
                  }))
                }
                onSetQuestionCardAnswer={onSetQuestionCardAnswer}
                onSetQuestionCardNote={onSetQuestionCardNote}
                onAddQuestionOption={onAddQuestionOption}
                onDeleteQuestionCard={onDeleteQuestionCard}
              />
            ))}
        </div>
      </motion.div>
    </div>
  );
}
