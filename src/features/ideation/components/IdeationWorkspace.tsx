import { AnimatePresence } from 'motion/react';
import { useIdeationWorkspace } from '../hooks/useIdeationWorkspace';
import { CenterPanel } from './CenterPanel';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { DeleteBlockConfirmModal } from './modals/DeleteBlockConfirmModal';
import { DeleteProjectConfirmModal } from './modals/DeleteProjectConfirmModal';
import { NewProjectModal } from './modals/NewProjectModal';

export function IdeationWorkspace() {
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
    aiOutput,
    setAiOutput,
    artifactDraft,
    setArtifactDraft,
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
    applyAiExpansion,
    addSuggestedBlock,
    exportArtifact,
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

      <CenterPanel
        selectedBlock={selectedBlock}
        artifactDraft={artifactDraft}
        onUpdateBlock={updateBlock}
        onRequestDelete={setDeleteConfirmationId}
        onExportArtifact={exportArtifact}
        onCloseArtifact={() => setArtifactDraft(null)}
      />

      <div
        onMouseDown={startResizingRight}
        className={`w-1 bg-transparent hover:bg-blue-500/50 cursor-col-resize transition-colors z-10 shrink-0 ${isResizingRight ? 'bg-blue-500' : ''}`}
      />

      <RightSidebar
        rightWidth={rightWidth}
        selectedId={selectedId}
        isAiLoading={isAiLoading}
        aiOutput={aiOutput}
        onSetAiOutput={setAiOutput}
        onAiAction={handleAiAction}
        onApplyExpansion={applyAiExpansion}
        onAddSuggestedBlock={addSuggestedBlock}
      />
    </div>
  );
}
