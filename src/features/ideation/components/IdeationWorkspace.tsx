import { ChevronDown, ChevronRight, Download, FileText, Layers, MessageSquare, Plus, Save, Search, Sparkles, Trash2, X, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { MATURITY_COLORS } from '../constants';
import { useIdeationWorkspace } from '../hooks/useIdeationWorkspace';
import { MaturityState, Suggestion, ThinkingBlock } from '../types';

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

  const renderTree = (parentId: string | null = null, depth = 0) => {
    const children = filteredBlocks.filter((block) => block.parentId === parentId);
    if (children.length === 0 && parentId !== null) {
      return null;
    }

    return (
      <div className="flex flex-col">
        {children.map((block) => {
          const hasChildren = projectBlocks.some((candidate) => candidate.parentId === block.id);
          const isExpanded = expandedNodes.has(block.id);
          const isSelected = selectedId === block.id;

          return (
            <div key={block.id} className="flex flex-col">
              <div
                className={`group flex items-center py-1 px-2 cursor-pointer hover:bg-zinc-800 transition-colors ${isSelected ? 'bg-zinc-800 text-blue-400' : 'text-zinc-400'}`}
                style={{ paddingLeft: `${depth * 12 + 8}px` }}
                onClick={() => setSelectedId(block.id)}
              >
                <div
                  className="p-1 hover:bg-zinc-700 rounded mr-1"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleNode(block.id);
                  }}
                >
                  {hasChildren ? (
                    isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                  ) : (
                    <div className="w-[14px]" />
                  )}
                </div>
                <FileText size={14} className="mr-2 opacity-60" />
                <span className="text-sm truncate flex-1">{block.title}</span>
                <button
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-blue-400 transition-opacity"
                  onClick={(event) => {
                    event.stopPropagation();
                    addBlock(block.id);
                  }}
                >
                  <Plus size={14} />
                </button>
                <button
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                  onClick={(event) => {
                    event.stopPropagation();
                    setDeleteConfirmationId(block.id);
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {isExpanded && renderTree(block.id, depth + 1)}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={`flex h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30 overflow-hidden ${isResizingLeft || isResizingRight ? 'cursor-col-resize select-none' : ''}`}
    >
      <aside className="border-r border-zinc-800 flex flex-col bg-zinc-900/50 shrink-0" style={{ width: leftWidth }}>
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h1 className="font-bold text-sm tracking-tight flex items-center gap-2">
            <Layers size={18} className="text-blue-500" />
            munky.ai
          </h1>
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors"
            title="New Project"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="p-3 border-b border-zinc-800">
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Active Project</label>
          <div className="flex items-center gap-2">
            <select
              value={activeProjectId}
              onChange={(event) => {
                setActiveProjectId(event.target.value);
                setSelectedId(null);
              }}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md py-1.5 px-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none w-full"
            >
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <button
              onClick={() => setDeleteProjectConfirmationId(activeProjectId)}
              className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-red-400 shrink-0"
              title="Delete Project"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <div className="p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 text-zinc-500" size={14} />
            <input
              type="text"
              placeholder="Search blocks..."
              className="w-full bg-zinc-800 border-none rounded-md py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-blue-500 outline-none"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
          {renderTree(null)}
          <div
            className="flex items-center py-2 px-4 cursor-pointer text-zinc-500 hover:text-zinc-300 text-xs gap-2"
            onClick={() => addBlock(null)}
          >
            <Plus size={14} /> Add Root Block
          </div>
        </div>

        <div className="p-4 border-t border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
          Prototype v0.2
        </div>
      </aside>

      <div
        onMouseDown={startResizingLeft}
        className={`w-1 bg-transparent hover:bg-blue-500/50 cursor-col-resize transition-colors z-10 shrink-0 ${isResizingLeft ? 'bg-blue-500' : ''}`}
      />

      <AnimatePresence>
        {showNewProjectModal && (
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
                <button onClick={() => setShowNewProjectModal(false)} className="text-zinc-500 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold block">Your Idea</label>
                <textarea
                  value={newProjectIdea}
                  onChange={(event) => setNewProjectIdea(event.target.value)}
                  placeholder="e.g., A mobile app for local gardeners to swap seeds and tools..."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-4 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none min-h-[120px] resize-none"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowNewProjectModal(false)}
                  className="flex-1 py-3 bg-zinc-800 hover:bg-zinc-700 text-sm font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={createProject}
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
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteConfirmationId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-2">Delete Thinking Block?</h3>
              <p className="text-sm text-zinc-400 mb-6">
                This will permanently remove "
                <span className="text-zinc-200">{blocks.find((block) => block.id === deleteConfirmationId)?.title}</span>" and all
                of its nested child blocks. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmationId(null)}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteBlock(deleteConfirmationId)}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-sm font-bold rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteProjectConfirmationId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 max-w-sm w-full shadow-2xl"
            >
              <h3 className="text-lg font-bold mb-2 text-red-400">Delete Project?</h3>
              <p className="text-sm text-zinc-400 mb-6">
                This will permanently remove the project "
                <span className="text-zinc-200">
                  {projects.find((project) => project.id === deleteProjectConfirmationId)?.name}
                </span>
                " and all of its thinking blocks. This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteProjectConfirmationId(null)}
                  className="flex-1 py-2 bg-zinc-800 hover:bg-zinc-700 text-sm font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteProject(deleteProjectConfirmationId)}
                  className="flex-1 py-2 bg-red-600 hover:bg-red-500 text-sm font-bold rounded-lg transition-colors"
                >
                  Delete Project
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950">
        {selectedBlock ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/20">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-zinc-500" />
                <input
                  type="text"
                  value={selectedBlock.title}
                  onChange={(event) => updateBlock(selectedBlock.id, { title: event.target.value })}
                  className="bg-transparent border-none text-lg font-medium focus:ring-0 outline-none w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-wider ${MATURITY_COLORS[selectedBlock.maturityState]}`}
                >
                  {selectedBlock.maturityState}
                </span>
                <button
                  onClick={() => setDeleteConfirmationId(selectedBlock.id)}
                  className="p-2 hover:bg-zinc-800 rounded-md text-zinc-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </header>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              <div className="max-w-3xl mx-auto space-y-8">
                <section>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Summary</label>
                  <textarea
                    value={selectedBlock.summary}
                    onChange={(event) => updateBlock(selectedBlock.id, { summary: event.target.value })}
                    placeholder="A brief overview of this thinking block..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none min-h-[80px] resize-none"
                  />
                </section>

                <section>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Notes & Content</label>
                  <textarea
                    value={selectedBlock.content}
                    onChange={(event) => updateBlock(selectedBlock.id, { content: event.target.value })}
                    placeholder="Detailed thoughts, data, and exploration..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none min-h-[300px] resize-y"
                  />
                </section>

                <div className="grid grid-cols-2 gap-8">
                  <section>
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Maturity State</label>
                    <select
                      value={selectedBlock.maturityState}
                      onChange={(event) =>
                        updateBlock(selectedBlock.id, { maturityState: event.target.value as MaturityState })
                      }
                      className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 text-sm focus:border-blue-500/50 outline-none appearance-none"
                    >
                      <option value="Exploratory">Exploratory</option>
                      <option value="Developing">Developing</option>
                      <option value="Validated">Validated</option>
                      <option value="Locked">Locked</option>
                    </select>
                  </section>
                  <section>
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedBlock.tags.map((tag) => (
                        <span key={tag} className="flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded">
                          {tag}
                          <button
                            onClick={() =>
                              updateBlock(selectedBlock.id, { tags: selectedBlock.tags.filter((value) => value !== tag) })
                            }
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                      <input
                        type="text"
                        placeholder="+ Add tag"
                        className="bg-transparent border-none text-xs focus:ring-0 outline-none w-20"
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter') {
                            return;
                          }

                          const value = event.currentTarget.value.trim();
                          if (value && !selectedBlock.tags.includes(value)) {
                            updateBlock(selectedBlock.id, { tags: [...selectedBlock.tags, value] });
                            event.currentTarget.value = '';
                          }
                        }}
                      />
                    </div>
                  </section>
                </div>

                {artifactDraft && (
                  <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-12 border-t border-zinc-800 pt-8">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">
                        Artifact Preview (Generated)
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => exportArtifact(selectedBlock.title)}
                          className="flex items-center gap-2 text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md transition-colors"
                        >
                          <Download size={14} /> Export MD
                        </button>
                        <button onClick={() => setArtifactDraft(null)} className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500">
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                    <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-8 prose prose-invert prose-sm max-w-none">
                      <ReactMarkdown>{artifactDraft}</ReactMarkdown>
                    </div>
                  </motion.section>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-500">
            <Layers size={48} className="mb-4 opacity-20" />
            <p>Select a block to start ideating</p>
          </div>
        )}
      </main>

      <div
        onMouseDown={startResizingRight}
        className={`w-1 bg-transparent hover:bg-blue-500/50 cursor-col-resize transition-colors z-10 shrink-0 ${isResizingRight ? 'bg-blue-500' : ''}`}
      />

      <aside className="border-l border-zinc-800 flex flex-col bg-zinc-900/50 shrink-0" style={{ width: rightWidth }}>
        <div className="p-4 border-b border-zinc-800 flex items-center gap-2">
          <Sparkles size={18} className="text-blue-400" />
          <h2 className="font-bold text-sm tracking-tight">AI ASSISTANT</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleAiAction('expand')}
              disabled={isAiLoading || !selectedId}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg transition-all border border-zinc-700/50"
            >
              <Zap size={16} className="text-yellow-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Expand</span>
            </button>
            <button
              onClick={() => handleAiAction('clarify')}
              disabled={isAiLoading || !selectedId}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg transition-all border border-zinc-700/50"
            >
              <MessageSquare size={16} className="text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Clarify</span>
            </button>
            <button
              onClick={() => handleAiAction('suggest')}
              disabled={isAiLoading || !selectedId}
              className="flex flex-col items-center justify-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 rounded-lg transition-all border border-zinc-700/50"
            >
              <Plus size={16} className="text-green-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider">Suggest</span>
            </button>
            <button
              onClick={() => handleAiAction('artifact')}
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
                  <button onClick={() => setAiOutput(null)} className="text-zinc-500 hover:text-white">
                    <X size={14} />
                  </button>
                </div>

                {aiOutput.type === 'expand' && (
                  <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4 space-y-3">
                    <p className="text-xs text-zinc-300 leading-relaxed italic">&quot;{aiOutput.content.summary}&quot;</p>
                    <button
                      onClick={applyAiExpansion}
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
                    {aiOutput.content.map((suggestion: Suggestion, index) => (
                      <div key={index} className="bg-zinc-800/50 border border-zinc-800 p-3 rounded-lg space-y-2">
                        <h4 className="text-xs font-bold text-green-400">{suggestion.title}</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{suggestion.description}</p>
                        <button
                          onClick={() => addSuggestedBlock(suggestion)}
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
    </div>
  );
}
