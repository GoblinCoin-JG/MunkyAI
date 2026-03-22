import { Layers, Plus, Search, Trash2 } from 'lucide-react';
import { BlockTree } from './BlockTree';
import { Project, ThinkingBlock } from '../types';

interface LeftSidebarProps {
  leftWidth: number;
  projects: Project[];
  activeProjectId: string;
  searchQuery: string;
  filteredBlocks: ThinkingBlock[];
  projectBlocks: ThinkingBlock[];
  expandedNodes: Set<string>;
  selectedId: string | null;
  onShowNewProjectModal: () => void;
  onSetActiveProjectId: (id: string) => void;
  onSelectBlock: (id: string | null) => void;
  onSetSearchQuery: (value: string) => void;
  onAddBlock: (parentId?: string | null) => void;
  onRequestDeleteProject: (id: string) => void;
  onRequestDeleteBlock: (id: string) => void;
  onToggleNode: (id: string) => void;
}

export function LeftSidebar({
  leftWidth,
  projects,
  activeProjectId,
  searchQuery,
  filteredBlocks,
  projectBlocks,
  expandedNodes,
  selectedId,
  onShowNewProjectModal,
  onSetActiveProjectId,
  onSelectBlock,
  onSetSearchQuery,
  onAddBlock,
  onRequestDeleteProject,
  onRequestDeleteBlock,
  onToggleNode,
}: LeftSidebarProps) {
  return (
    <aside className="border-r border-zinc-800 flex flex-col bg-zinc-900/50 shrink-0" style={{ width: leftWidth }}>
      <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
        <h1 className="font-bold text-sm tracking-tight flex items-center gap-2">
          <Layers size={18} className="text-blue-500" />
          munky.ai
        </h1>
        <button
          onClick={onShowNewProjectModal}
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
              onSetActiveProjectId(event.target.value);
              onSelectBlock(null);
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
            onClick={() => onRequestDeleteProject(activeProjectId)}
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
            onChange={(event) => onSetSearchQuery(event.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-2 custom-scrollbar">
        <BlockTree
          filteredBlocks={filteredBlocks}
          projectBlocks={projectBlocks}
          expandedNodes={expandedNodes}
          selectedId={selectedId}
          onSelect={onSelectBlock}
          onToggleNode={onToggleNode}
          onAddChild={(parentId) => onAddBlock(parentId)}
          onRequestDelete={onRequestDeleteBlock}
        />

        <div
          className="flex items-center py-2 px-4 cursor-pointer text-zinc-500 hover:text-zinc-300 text-xs gap-2"
          onClick={() => onAddBlock(null)}
        >
          <Plus size={14} /> Add Root Block
        </div>
      </div>

      <div className="p-4 border-t border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">
        Prototype v0.2
      </div>
    </aside>
  );
}
