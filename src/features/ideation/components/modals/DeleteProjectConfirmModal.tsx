import { motion } from 'motion/react';
import { Project } from '../../types';

interface DeleteProjectConfirmModalProps {
  projectId: string | null;
  projects: Project[];
  onCancel: () => void;
  onConfirm: (id: string) => void;
}

export function DeleteProjectConfirmModal({
  projectId,
  projects,
  onCancel,
  onConfirm,
}: DeleteProjectConfirmModalProps) {
  if (!projectId) {
    return null;
  }

  const projectName = projects.find((project) => project.id === projectId)?.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-2xl"
      >
        <h3 className="text-lg font-bold mb-2 text-red-400">Delete Project?</h3>
        <p className="text-sm text-zinc-400 mb-6">
          This will permanently remove the project "<span className="text-zinc-200">{projectName}</span>" and all of its thinking blocks. This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-bold rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(projectId)}
            className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-sm font-bold rounded-lg transition-colors"
          >
            Delete Project
          </button>
        </div>
      </motion.div>
    </div>
  );
}
