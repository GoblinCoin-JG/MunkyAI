import { AnimatePresence } from 'motion/react';
import { useState } from 'react';
import { useIdeationWorkspace } from '../hooks/useIdeationWorkspace';
import { CenterPanel } from './CenterPanel';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { DeleteBlockConfirmModal } from './modals/DeleteBlockConfirmModal';
import { DeleteProjectConfirmModal } from './modals/DeleteProjectConfirmModal';
import { DeleteQuestionBoardConfirmModal } from './modals/DeleteQuestionBoardConfirmModal';
import { ExpandBoardModal } from './modals/ExpandBoardModal';
import { NewProjectModal } from './modals/NewProjectModal';
import { QuestionBoardModal } from './modals/QuestionBoardModal';
import { ChallengeModal } from './modals/ChallengeModal';

export function IdeationWorkspace() {
  const [isExpandBoardOpen, setIsExpandBoardOpen] = useState(false);
  const [isQuestionBoardOpen, setIsQuestionBoardOpen] = useState(false);
  const [isChallengeOpen, setIsChallengeOpen] = useState(false);
  const [showDeleteQuestionBoardConfirm, setShowDeleteQuestionBoardConfirm] = useState(false);

  const {
    projects,
    activeProjectId,
    setActiveProjectId,
    blocks,
    selectedId,
    setSelectedId,
    searchQuery,
    setSearchQuery,
    isAiLoading,
    isSubmittingExpandBoard,
    isSubmittingClarifyBoard,
    aiOutput,
    setAiOutput,
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
    expandedNodes,
    deleteConfirmationId,
    setDeleteConfirmationId,
    deleteProjectConfirmationId,
    setDeleteProjectConfirmationId,
    showNewProjectModal,
    setShowNewProjectModal,
    newProjectIdea,
    setNewProjectIdea,
    leftWidth,
    rightWidth,
    isResizingLeft,
    isResizingRight,
    startResizingLeft,
    startResizingRight,
    projectBlocks,
    selectedBlock,
    filteredBlocks,
    createProject,
    addBlock,
    updateBlock,
    deleteBlock,
    deleteProject,
    toggleNode,
    handleAiAction,
    setExpandCardDetail,
    setExpandCardContext,
    deleteExpandCard,
    addCustomExpandCard,
    addAiExpandCard,
    submitExpandBoard,
    clearExpandBoard,
    setQuestionCardAnswer,
    setQuestionCardNote,
    addQuestionOption,
    deleteQuestionCard,
    addCustomQuestionCard,
    addAiQuestionCard,
    submitQuestionBoard,
    clearQuestionBoard,
    addSuggestedBlock,
    setChallengeItemResponse,
    setChallengeItemStatus,
    clearChallenge,
    applyChallengeResponsesToBlock,
  } = useIdeationWorkspace();

  return (
    <div
      className={`flex h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30 overflow-hidden ${isResizingLeft || isResizingRight ? 'cursor-col-resize select-none' : ''}`}
    >
      <LeftSidebar
        leftWidth={leftWidth}
        projects={projects}
        activeProjectId={activeProjectId}
        searchQuery={searchQuery}
        filteredBlocks={filteredBlocks}
        projectBlocks={projectBlocks}
        expandedNodes={expandedNodes}
        selectedId={selectedId}
        onShowNewProjectModal={() => setShowNewProjectModal(true)}
        onSetActiveProjectId={setActiveProjectId}
        onSelectBlock={setSelectedId}
        onSetSearchQuery={setSearchQuery}
        onAddBlock={addBlock}
        onRequestDeleteProject={setDeleteProjectConfirmationId}
        onRequestDeleteBlock={setDeleteConfirmationId}
        onToggleNode={toggleNode}
      />

      <div
        onMouseDown={startResizingLeft}
        className={`w-1 bg-transparent hover:bg-blue-500/50 cursor-col-resize transition-colors z-10 shrink-0 ${isResizingLeft ? 'bg-blue-500' : ''}`}
      />

      <AnimatePresence>
        <NewProjectModal
          isOpen={showNewProjectModal}
          isAiLoading={isAiLoading}
          newProjectIdea={newProjectIdea}
          onClose={() => setShowNewProjectModal(false)}
          onChangeIdea={setNewProjectIdea}
          onCreateProject={createProject}
        />
      </AnimatePresence>

      <AnimatePresence>
        <DeleteBlockConfirmModal
          blockId={deleteConfirmationId}
          blocks={blocks}
          onCancel={() => setDeleteConfirmationId(null)}
          onConfirm={deleteBlock}
        />
      </AnimatePresence>

      <AnimatePresence>
        <DeleteProjectConfirmModal
          projectId={deleteProjectConfirmationId}
          projects={projects}
          onCancel={() => setDeleteProjectConfirmationId(null)}
          onConfirm={deleteProject}
        />
      </AnimatePresence>

      <AnimatePresence>
        <ExpandBoardModal
          isOpen={isExpandBoardOpen}
          selectedId={selectedId}
          isAiLoading={isAiLoading}
          isSubmittingExpandBoard={isSubmittingExpandBoard}
          expandBoard={expandBoard}
          expandBoardError={expandBoardError}
          expandBoardIncompleteIds={expandBoardIncompleteIds}
          expandBoardCompletion={expandBoardCompletion}
          onClose={() => setIsExpandBoardOpen(false)}
          onSetExpandCardDetail={setExpandCardDetail}
          onSetExpandCardContext={setExpandCardContext}
          onDeleteExpandCard={deleteExpandCard}
          onAddCustomExpandCard={addCustomExpandCard}
          onAddAiExpandCard={addAiExpandCard}
          onSubmitExpandBoard={submitExpandBoard}
        />
      </AnimatePresence>

      <AnimatePresence>
        <QuestionBoardModal
          isOpen={isQuestionBoardOpen}
          selectedId={selectedId}
          isAiLoading={isAiLoading}
          isSubmittingClarifyBoard={isSubmittingClarifyBoard}
          clarifyBoard={clarifyBoard}
          clarifyBoardError={clarifyBoardError}
          clarifyBoardUnansweredIds={clarifyBoardUnansweredIds}
          clarifyBoardCompletion={clarifyBoardCompletion}
          onClose={() => setIsQuestionBoardOpen(false)}
          onSetQuestionCardAnswer={setQuestionCardAnswer}
          onSetQuestionCardNote={setQuestionCardNote}
          onAddQuestionOption={addQuestionOption}
          onDeleteQuestionCard={deleteQuestionCard}
          onAddCustomQuestionCard={addCustomQuestionCard}
          onAddAiQuestionCard={addAiQuestionCard}
          onSubmitQuestionBoard={submitQuestionBoard}
        />
      </AnimatePresence>

      <AnimatePresence>
        <DeleteQuestionBoardConfirmModal
          isOpen={showDeleteQuestionBoardConfirm}
          blockTitle={selectedBlock?.title || 'Selected Block'}
          onCancel={() => setShowDeleteQuestionBoardConfirm(false)}
          onConfirm={() => {
            clearQuestionBoard();
            setIsQuestionBoardOpen(false);
            setShowDeleteQuestionBoardConfirm(false);
          }}
        />
      </AnimatePresence>

      <CenterPanel
        selectedBlock={selectedBlock}
        onUpdateBlock={updateBlock}
        onRequestDelete={setDeleteConfirmationId}
      />

      <div
        onMouseDown={startResizingRight}
        className={`w-1 bg-transparent hover:bg-blue-500/50 cursor-col-resize transition-colors z-10 shrink-0 ${isResizingRight ? 'bg-blue-500' : ''}`}
      />

      <RightSidebar
        rightWidth={rightWidth}
        selectedId={selectedId}
        isAiLoading={isAiLoading}
        isSubmittingExpandBoard={isSubmittingExpandBoard}
        isSubmittingClarifyBoard={isSubmittingClarifyBoard}
        aiOutput={aiOutput}
        expandBoard={expandBoard}
        expandBoardError={expandBoardError}
        expandBoardIncompleteIds={expandBoardIncompleteIds}
        expandBoardCompletion={expandBoardCompletion}
        clarifyBoard={clarifyBoard}
        clarifyBoardError={clarifyBoardError}
        clarifyBoardUnansweredIds={clarifyBoardUnansweredIds}
        clarifyBoardCompletion={clarifyBoardCompletion}
        challengeResult={challengeResult}
        challengeError={challengeError}
        challengeOpenCount={challengeOpenCount}
        challengeAnsweredCount={challengeAnsweredCount}
        onSetAiOutput={setAiOutput}
        onAiAction={(action) => {
          void handleAiAction(action).then(() => {
            if (action === 'expand' && selectedId) {
              setIsExpandBoardOpen(true);
            }
            if (action === 'challenge' && selectedId) {
              setIsChallengeOpen(true);
            }
          });
        }}
        onOpenExpandBoard={() => setIsExpandBoardOpen(true)}
        onClearExpandBoard={() => {
          clearExpandBoard();
          setIsExpandBoardOpen(false);
        }}
        onOpenQuestionBoard={() => setIsQuestionBoardOpen(true)}
        onRequestDeleteQuestionBoard={() => setShowDeleteQuestionBoardConfirm(true)}
        onOpenChallengeModal={() => setIsChallengeOpen(true)}
        onClearChallenge={clearChallenge}
        onAddSuggestedBlock={addSuggestedBlock}
      />

      <AnimatePresence>
        <ChallengeModal
          isOpen={isChallengeOpen}
          blockTitle={selectedBlock?.title || 'Selected Block'}
          isAiLoading={isAiLoading}
          challengeResult={challengeResult}
          challengeError={challengeError}
          onClose={() => setIsChallengeOpen(false)}
          onSetChallengeItemResponse={setChallengeItemResponse}
          onSetChallengeItemStatus={setChallengeItemStatus}
          onApplyResponsesToBlock={applyChallengeResponsesToBlock}
        />
      </AnimatePresence>
    </div>
  );
}
