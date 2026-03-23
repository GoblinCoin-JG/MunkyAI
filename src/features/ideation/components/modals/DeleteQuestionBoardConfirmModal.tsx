import { motion } from 'motion/react';

interface DeleteQuestionBoardConfirmModalProps {
  isOpen: boolean;
  blockTitle: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export function DeleteQuestionBoardConfirmModal({
  isOpen,
  blockTitle,
  onCancel,
  onConfirm,
}: DeleteQuestionBoardConfirmModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-2xl"
      >
        <h3 className="text-lg font-bold mb-2 text-red-400">Delete Question Board?</h3>
        <p className="text-sm text-zinc-400 mb-6">
          This will permanently remove the question board for "
          <span className="text-zinc-200">{blockTitle}</span>" and all current answers. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-bold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-sm font-bold rounded-lg transition-colors"
          >
            Delete Board
          </button>
        </div>
      </motion.div>
    </div>
  );
}
