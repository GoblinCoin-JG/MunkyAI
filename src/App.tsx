/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  ChevronRight, 
  ChevronDown, 
  FileText, 
  Sparkles, 
  Trash2, 
  Search, 
  Save,
  Download,
  X,
  MessageSquare,
  Layers,
  CheckCircle2,
  Lock,
  Zap,
  MoreVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { ThinkingBlock, MaturityState, aiService, Suggestion, ScaffoldingBlock } from './services/aiService';

// --- Types & Constants ---

export interface Project {
  id: string;
  name: string;
  createdAt: number;
}

const INITIAL_PROJECT_ID = 'p1';

const INITIAL_PROJECTS: Project[] = [
  { id: INITIAL_PROJECT_ID, name: 'Main Project', createdAt: Date.now() }
];

const MATURITY_COLORS: Record<MaturityState, string> = {
  Exploratory: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  Developing: 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10',
  Validated: 'text-green-400 border-green-400/30 bg-green-400/10',
  Locked: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
};

const INITIAL_BLOCKS: ThinkingBlock[] = [
  {
    id: '1',
    projectId: INITIAL_PROJECT_ID,
    parentId: null,
    title: 'My Idea',
    summary: 'A revolutionary new way to explore ideas.',
    content: 'This project aims to bridge the gap between raw thought and structured output.',
    tags: ['vision', 'startup'],
    maturityState: 'Exploratory',
  },
  {
    id: '2',
    projectId: INITIAL_PROJECT_ID,
    parentId: '1',
    title: 'Core Concept',
    summary: 'The fundamental mechanism of the app.',
    content: 'Thinking blocks that can be nested and expanded by AI.',
    tags: ['product', 'core'],
    maturityState: 'Developing',
  },
  {
    id: '3',
    projectId: INITIAL_PROJECT_ID,
    parentId: '1',
    title: 'Audience',
    summary: 'Who is this for?',
    content: 'Writers, researchers, and creative thinkers who need structure.',
    tags: ['market'],
    maturityState: 'Exploratory',
  },
  {
    id: '4',
    projectId: INITIAL_PROJECT_ID,
    parentId: '1',
    title: 'Main Workflow',
    summary: 'How the user interacts with the system.',
    content: 'Create block -> Expand with AI -> Refine -> Generate Artifact.',
    tags: ['ux'],
    maturityState: 'Exploratory',
  },
  {
    id: '5',
    projectId: INITIAL_PROJECT_ID,
    parentId: '1',
    title: 'Risks',
    summary: 'Potential pitfalls.',
    content: 'AI hallucinations, over-reliance on automation, data privacy.',
    tags: ['strategy'],
    maturityState: 'Exploratory',
  },
];

// --- Components ---

export default function App() {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('idea-ide-projects');
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const saved = localStorage.getItem('idea-ide-active-project');
    return saved || INITIAL_PROJECT_ID;
  });
  const [blocks, setBlocks] = useState<ThinkingBlock[]>(() => {
    const saved = localStorage.getItem('idea-ide-blocks');
    return saved ? JSON.parse(saved) : INITIAL_BLOCKS;
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiOutput, setAiOutput] = useState<{ type: string; content: any } | null>(null);
  const [artifactDraft, setArtifactDraft] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1']));
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [deleteProjectConfirmationId, setDeleteProjectConfirmationId] = useState<string | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectIdea, setNewProjectIdea] = useState('');

  // --- Sidebar Resizing ---
  const [leftWidth, setLeftWidth] = useState(() => {
    const saved = localStorage.getItem('idea-ide-left-width');
    return saved ? parseInt(saved, 10) : 256;
  });
  const [rightWidth, setRightWidth] = useState(() => {
    const saved = localStorage.getItem('idea-ide-right-width');
    return saved ? parseInt(saved, 10) : 320;
  });
  const [isResizingLeft, setIsResizingLeft] = useState(false);
  const [isResizingRight, setIsResizingRight] = useState(false);

  const startResizingLeft = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingLeft(true);
  }, []);

  const startResizingRight = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizingRight(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizingLeft(false);
    setIsResizingRight(false);
  }, []);

  const resize = useCallback((e: MouseEvent) => {
    if (isResizingLeft) {
      const newWidth = e.clientX;
      if (newWidth > 160 && newWidth < 480) {
        setLeftWidth(newWidth);
      }
    }
    if (isResizingRight) {
      const newWidth = window.innerWidth - e.clientX;
      if (newWidth > 200 && newWidth < 600) {
        setRightWidth(newWidth);
      }
    }
  }, [isResizingLeft, isResizingRight]);

  useEffect(() => {
    if (isResizingLeft || isResizingRight) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    } else {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizingLeft, isResizingRight, resize, stopResizing]);

  useEffect(() => {
    localStorage.setItem('idea-ide-projects', JSON.stringify(projects));
    localStorage.setItem('idea-ide-active-project', activeProjectId);
    localStorage.setItem('idea-ide-blocks', JSON.stringify(blocks));
    localStorage.setItem('idea-ide-left-width', leftWidth.toString());
    localStorage.setItem('idea-ide-right-width', rightWidth.toString());
  }, [projects, activeProjectId, blocks, leftWidth, rightWidth]);

  const activeProject = useMemo(() => projects.find(p => p.id === activeProjectId), [projects, activeProjectId]);
  const projectBlocks = useMemo(() => blocks.filter(b => b.projectId === activeProjectId), [blocks, activeProjectId]);
  const selectedBlock = useMemo(() => projectBlocks.find(b => b.id === selectedId) || null, [projectBlocks, selectedId]);

  const filteredBlocks = useMemo(() => {
    if (!searchQuery) return projectBlocks;
    return projectBlocks.filter(b => b.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [projectBlocks, searchQuery]);

  // --- Handlers ---

  const createProject = async () => {
    if (!newProjectIdea.trim()) return;
    setIsAiLoading(true);
    try {
      const scaffold = await aiService.generateProjectStructure(newProjectIdea);
      const newProjectId = Math.random().toString(36).substr(2, 9);
      const newProject: Project = {
        id: newProjectId,
        name: scaffold.projectName,
        createdAt: Date.now()
      };

      const rootBlockId = Math.random().toString(36).substr(2, 9);
      const rootBlock: ThinkingBlock = {
        id: rootBlockId,
        projectId: newProjectId,
        parentId: null,
        title: scaffold.projectName,
        summary: newProjectIdea,
        content: '',
        tags: ['root'],
        maturityState: 'Exploratory'
      };

      const childBlocks: ThinkingBlock[] = scaffold.blocks.map(b => ({
        id: Math.random().toString(36).substr(2, 9),
        projectId: newProjectId,
        parentId: rootBlockId,
        title: b.title,
        summary: b.summary,
        content: b.content,
        tags: b.tags,
        maturityState: 'Exploratory'
      }));

      setProjects([...projects, newProject]);
      setBlocks([...blocks, rootBlock, ...childBlocks]);
      setActiveProjectId(newProjectId);
      setSelectedId(rootBlockId);
      setExpandedNodes(new Set([rootBlockId]));
      setShowNewProjectModal(false);
      setNewProjectIdea('');
    } catch (err) {
      console.error(err);
      alert('Failed to generate project structure.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const addBlock = (parentId: string | null = null) => {
    const newBlock: ThinkingBlock = {
      id: Math.random().toString(36).substr(2, 9),
      projectId: activeProjectId,
      parentId,
      title: 'New Block',
      summary: '',
      content: '',
      tags: [],
      maturityState: 'Exploratory',
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
    if (parentId) {
      setExpandedNodes(prev => new Set(prev).add(parentId));
    }
  };

  const updateBlock = (id: string, updates: Partial<ThinkingBlock>) => {
    setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const deleteBlock = (id: string) => {
    const toDelete = new Set([id]);
    const findChildren = (pid: string) => {
      blocks.filter(b => b.projectId === activeProjectId && b.parentId === pid).forEach(child => {
        toDelete.add(child.id);
        findChildren(child.id);
      });
    };
    findChildren(id);
    setBlocks(blocks.filter(b => !toDelete.has(b.id)));
    if (selectedId === id || toDelete.has(selectedId || '')) setSelectedId(null);
    setDeleteConfirmationId(null);
  };

  const deleteProject = (id: string) => {
    if (projects.length <= 1) {
      alert("You must have at least one project.");
      return;
    }
    const nextProject = projects.find(p => p.id !== id);
    setProjects(projects.filter(p => p.id !== id));
    setBlocks(blocks.filter(b => b.projectId !== id));
    if (activeProjectId === id && nextProject) {
      setActiveProjectId(nextProject.id);
      setSelectedId(null);
    }
    setDeleteProjectConfirmationId(null);
  };

  const toggleNode = (id: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // --- AI Actions ---

  const handleAiAction = async (action: 'expand' | 'clarify' | 'suggest' | 'artifact') => {
    if (!selectedBlock) return;
    setIsAiLoading(true);
    setAiOutput(null);
    try {
      switch (action) {
        case 'expand':
          const expanded = await aiService.expandBlock(selectedBlock);
          setAiOutput({ type: 'expand', content: expanded });
          break;
        case 'clarify':
          const questions = await aiService.clarifyBlock(selectedBlock);
          setAiOutput({ type: 'clarify', content: questions });
          break;
        case 'suggest':
          const suggestions = await aiService.suggestChildren(selectedBlock);
          setAiOutput({ type: 'suggest', content: suggestions });
          break;
        case 'artifact':
          const children = projectBlocks.filter(b => b.parentId === selectedBlock.id);
          const draft = await aiService.generateArtifact(selectedBlock, children);
          setArtifactDraft(draft);
          break;
      }
    } catch (err) {
      console.error(err);
      alert('AI Action failed. Check console.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const applyAiExpansion = () => {
    if (aiOutput?.type === 'expand' && selectedId) {
      updateBlock(selectedId, {
        summary: aiOutput.content.summary,
        content: aiOutput.content.content
      });
      setAiOutput(null);
    }
  };

  const addSuggestedBlock = (suggestion: Suggestion) => {
    if (!selectedId) return;
    const newBlock: ThinkingBlock = {
      id: Math.random().toString(36).substr(2, 9),
      projectId: activeProjectId,
      parentId: selectedId,
      title: suggestion.title,
      summary: suggestion.description,
      content: '',
      tags: [],
      maturityState: 'Exploratory',
    };
    setBlocks([...blocks, newBlock]);
    setExpandedNodes(prev => new Set(prev).add(selectedId));
  };

  // --- Render Helpers ---

  const renderTree = (parentId: string | null = null, depth = 0) => {
    const children = filteredBlocks.filter(b => b.parentId === parentId);
    if (children.length === 0 && parentId !== null) return null;

    return (
      <div className="flex flex-col">
        {children.map(block => {
          const hasChildren = projectBlocks.some(b => b.parentId === block.id);
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
                  onClick={(e) => {
                    e.stopPropagation();
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
                  onClick={(e) => {
                    e.stopPropagation();
                    addBlock(block.id);
                  }}
                >
                  <Plus size={14} />
                </button>
                <button 
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
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
    <div className={`flex h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30 overflow-hidden ${isResizingLeft || isResizingRight ? 'cursor-col-resize select-none' : ''}`}>
      {/* --- Left Sidebar: Project Tree --- */}
      <aside 
        className="border-r border-zinc-800 flex flex-col bg-zinc-900/50 shrink-0"
        style={{ width: leftWidth }}
      >
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h1 className="font-bold text-sm tracking-tight flex items-center gap-2">
            <Layers size={18} className="text-blue-500" />
            IDEA IDE LITE
          </h1>
          <button 
            onClick={() => setShowNewProjectModal(true)}
            className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition-colors"
            title="New Project"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Project Switcher */}
        <div className="p-3 border-b border-zinc-800">
          <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Active Project</label>
          <div className="flex items-center gap-2">
            <select 
              value={activeProjectId}
              onChange={(e) => {
                setActiveProjectId(e.target.value);
                setSelectedId(null);
              }}
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md py-1.5 px-2 text-xs focus:ring-1 focus:ring-blue-500 outline-none w-full"
            >
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
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
              onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Left Resizer */}
      <div 
        onMouseDown={startResizingLeft}
        className={`w-1 bg-transparent hover:bg-blue-500/50 cursor-col-resize transition-colors z-10 shrink-0 ${isResizingLeft ? 'bg-blue-500' : ''}`}
      />

      {/* --- New Project Modal --- */}
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
                  onChange={(e) => setNewProjectIdea(e.target.value)}
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
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
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

      {/* --- Delete Confirmation Modal --- */}
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
                This will permanently remove "<span className="text-zinc-200">{blocks.find(b => b.id === deleteConfirmationId)?.title}</span>" and all of its nested child blocks. This action cannot be undone.
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

      {/* --- Delete Project Confirmation Modal --- */}
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
                This will permanently remove the project "<span className="text-zinc-200">{projects.find(p => p.id === deleteProjectConfirmationId)?.name}</span>" and all of its thinking blocks. This action cannot be undone.
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

      {/* --- Center: Selected Block Editor --- */}

      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950">
        {selectedBlock ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-6 bg-zinc-900/20">
              <div className="flex items-center gap-3">
                <FileText size={18} className="text-zinc-500" />
                <input 
                  type="text"
                  value={selectedBlock.title}
                  onChange={(e) => updateBlock(selectedBlock.id, { title: e.target.value })}
                  className="bg-transparent border-none text-lg font-medium focus:ring-0 outline-none w-64"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full border uppercase font-bold tracking-wider ${MATURITY_COLORS[selectedBlock.maturityState]}`}>
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
                {/* Summary */}
                <section>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Summary</label>
                  <textarea 
                    value={selectedBlock.summary}
                    onChange={(e) => updateBlock(selectedBlock.id, { summary: e.target.value })}
                    placeholder="A brief overview of this thinking block..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none min-h-[80px] resize-none"
                  />
                </section>

                {/* Notes/Content */}
                <section>
                  <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Notes & Content</label>
                  <textarea 
                    value={selectedBlock.content}
                    onChange={(e) => updateBlock(selectedBlock.id, { content: e.target.value })}
                    placeholder="Detailed thoughts, data, and exploration..."
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 text-sm focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 outline-none min-h-[300px] resize-y"
                  />
                </section>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-8">
                  <section>
                    <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-2 block">Maturity State</label>
                    <select 
                      value={selectedBlock.maturityState}
                      onChange={(e) => updateBlock(selectedBlock.id, { maturityState: e.target.value as MaturityState })}
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
                      {selectedBlock.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 bg-zinc-800 text-zinc-300 text-xs px-2 py-1 rounded">
                          {tag}
                          <button onClick={() => updateBlock(selectedBlock.id, { tags: selectedBlock.tags.filter(t => t !== tag) })}>
                            <X size={10} />
                          </button>
                        </span>
                      ))}
                      <input 
                        type="text"
                        placeholder="+ Add tag"
                        className="bg-transparent border-none text-xs focus:ring-0 outline-none w-20"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = e.currentTarget.value.trim();
                            if (val && !selectedBlock.tags.includes(val)) {
                              updateBlock(selectedBlock.id, { tags: [...selectedBlock.tags, val] });
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                      />
                    </div>
                  </section>
                </div>

                {/* Artifact Preview Section */}
                {artifactDraft && (
                  <motion.section 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-12 border-t border-zinc-800 pt-8"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-[10px] uppercase tracking-widest text-blue-400 font-bold">Artifact Preview (Generated)</label>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => {
                            const blob = new Blob([artifactDraft], { type: 'text/markdown' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `${selectedBlock.title.toLowerCase().replace(/\s+/g, '-')}-artifact.md`;
                            a.click();
                          }}
                          className="flex items-center gap-2 text-xs bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-md transition-colors"
                        >
                          <Download size={14} /> Export MD
                        </button>
                        <button 
                          onClick={() => setArtifactDraft(null)}
                          className="p-1.5 hover:bg-zinc-800 rounded-md text-zinc-500"
                        >
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

      {/* Right Resizer */}
      <div 
        onMouseDown={startResizingRight}
        className={`w-1 bg-transparent hover:bg-blue-500/50 cursor-col-resize transition-colors z-10 shrink-0 ${isResizingRight ? 'bg-blue-500' : ''}`}
      />

      {/* --- Right Sidebar: AI Assistant Panel --- */}
      <aside 
        className="border-l border-zinc-800 flex flex-col bg-zinc-900/50 shrink-0"
        style={{ width: rightWidth }}
      >
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
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              >
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
                    <p className="text-xs text-zinc-300 leading-relaxed italic">"{aiOutput.content.summary}"</p>
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
                    {aiOutput.content.map((q: string, i: number) => (
                      <div key={i} className="bg-zinc-800/50 border border-zinc-800 p-3 rounded-lg text-xs leading-relaxed text-zinc-300">
                        {q}
                      </div>
                    ))}
                  </div>
                )}

                {aiOutput.type === 'suggest' && (
                  <div className="space-y-2">
                    {aiOutput.content.map((s: Suggestion, i: number) => (
                      <div key={i} className="bg-zinc-800/50 border border-zinc-800 p-3 rounded-lg space-y-2">
                        <h4 className="text-xs font-bold text-green-400">{s.title}</h4>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">{s.description}</p>
                        <button 
                          onClick={() => addSuggestedBlock(s)}
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
              <li><strong>Suggest</strong> helps overcome writer's block.</li>
              <li><strong>Artifact</strong> creates a shareable summary.</li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
