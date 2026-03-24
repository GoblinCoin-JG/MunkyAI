import { motion } from 'motion/react';
import { CheckCheck, Circle, MinusCircle, X } from 'lucide-react';
import { ChallengeItem, ChallengeResult } from '../../types';

interface ChallengeModalProps {
  isOpen: boolean;
  blockTitle: string;
  isAiLoading: boolean;
  isSubmittingChallenge: boolean;
  challengeResult: ChallengeResult | null;
  challengeError: string | null;
  onClose: () => void;
  onSetChallengeItemResponse: (itemId: string, userResponse: string) => void;
  onSetChallengeItemStatus: (itemId: string, status: ChallengeItem['status']) => void;
  onApplyResponsesToBlock: () => Promise<void>;
}

function ChallengeItemCard({
  item,
  onSetChallengeItemResponse,
  onSetChallengeItemStatus,
}: {
  item: ChallengeItem;
  onSetChallengeItemResponse: (itemId: string, userResponse: string) => void;
  onSetChallengeItemStatus: (itemId: string, status: ChallengeItem['status']) => void;
}) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4 space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold tracking-tight text-zinc-100">{item.focusText}</h4>
          <span className="rounded border border-zinc-700 px-2 py-0.5 text-[10px] uppercase tracking-wider text-zinc-400">
            {item.status}
          </span>
        </div>
        <p className="text-xs leading-5 text-zinc-200">{item.challengePrompt}</p>
        <p className="text-[11px] leading-5 text-zinc-500">{item.whyItMatters}</p>
      </div>

      <textarea
        value={item.userResponse}
        onChange={(event) => onSetChallengeItemResponse(item.id, event.target.value)}
        placeholder="Respond to this challenge..."
        className="w-full min-h-20 rounded-lg border border-zinc-700 bg-zinc-950/70 p-3 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-amber-500/50"
      />

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onSetChallengeItemStatus(item.id, 'open')}
          className={`rounded-md border px-2.5 py-1.5 text-[11px] ${item.status === 'open' ? 'border-blue-500/40 bg-blue-500/10 text-blue-200' : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
        >
          <span className="inline-flex items-center gap-1">
            <Circle size={12} /> Open
          </span>
        </button>
        <button
          onClick={() => onSetChallengeItemStatus(item.id, 'answered')}
          className={`rounded-md border px-2.5 py-1.5 text-[11px] ${item.status === 'answered' ? 'border-green-500/40 bg-green-500/10 text-green-200' : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
        >
          <span className="inline-flex items-center gap-1">
            <CheckCheck size={12} /> Answered
          </span>
        </button>
        <button
          onClick={() => onSetChallengeItemStatus(item.id, 'skipped')}
          className={`rounded-md border px-2.5 py-1.5 text-[11px] ${item.status === 'skipped' ? 'border-zinc-500/40 bg-zinc-500/10 text-zinc-200' : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
        >
          <span className="inline-flex items-center gap-1">
            <MinusCircle size={12} /> Skipped
          </span>
        </button>
        <button
          onClick={() => onSetChallengeItemStatus(item.id, 'resolved')}
          className={`rounded-md border px-2.5 py-1.5 text-[11px] ${item.status === 'resolved' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200' : 'border-zinc-700 bg-zinc-800 text-zinc-300 hover:bg-zinc-700'}`}
        >
          <span className="inline-flex items-center gap-1">
            <CheckCheck size={12} /> Resolved
          </span>
        </button>
      </div>
    </div>
  );
}

export function ChallengeModal({
  isOpen,
  blockTitle,
  isAiLoading,
  isSubmittingChallenge,
  challengeResult,
  challengeError,
  onClose,
  onSetChallengeItemResponse,
  onSetChallengeItemStatus,
  onApplyResponsesToBlock,
}: ChallengeModalProps) {
  if (!isOpen) {
    return null;
  }

  const hasAnsweredResponses = Boolean(challengeResult?.items.some((item) => item.userResponse.trim().length > 0));

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
            <h3 className="text-lg font-bold tracking-tight text-zinc-100">Challenge</h3>
            <p className="text-xs text-zinc-400">{blockTitle}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[68vh] overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {isAiLoading && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-400">
              Generating challenge items...
            </div>
          )}

          {!isAiLoading && challengeError && (
            <div className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-xs text-red-200">
              {challengeError}
            </div>
          )}

          {isSubmittingChallenge && (
            <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
              Applying challenge responses to the artifact...
            </div>
          )}

          {!isAiLoading && !challengeError && (!challengeResult || challengeResult.items.length === 0) && (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs text-zinc-500">
              No challenge items available yet. Generate Challenge from the AI panel.
            </div>
          )}

          {challengeResult &&
            challengeResult.items.map((item) => (
              <ChallengeItemCard
                key={item.id}
                item={item}
                onSetChallengeItemResponse={onSetChallengeItemResponse}
                onSetChallengeItemStatus={onSetChallengeItemStatus}
              />
            ))}
        </div>

        <div className="border-t border-zinc-800 p-4 flex items-center justify-between gap-2 bg-zinc-950/50">
          <p className="text-xs text-zinc-500">Apply responses merges resolved challenge insights back into this block&apos;s markdown artifact.</p>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-xs text-zinc-200 hover:bg-zinc-700"
            >
              Close
            </button>
            <button
              onClick={() => {
                void onApplyResponsesToBlock();
              }}
              disabled={!challengeResult || challengeResult.items.length === 0 || !hasAnsweredResponses || isSubmittingChallenge}
              className="rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-200 hover:bg-amber-500/20 disabled:opacity-50"
            >
              {isSubmittingChallenge ? 'Applying...' : 'Apply Responses to Block'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
