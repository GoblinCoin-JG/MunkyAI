import { ChevronDown, ChevronRight, FileText, Plus, Trash2 } from 'lucide-react';
import { ThinkingBlock } from '../types';

interface BlockTreeProps {
  filteredBlocks: ThinkingBlock[];
  projectBlocks: ThinkingBlock[];
  expandedNodes: Set<string>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleNode: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onRequestDelete: (id: string) => void;
}

export function BlockTree({
  filteredBlocks,
  projectBlocks,
  expandedNodes,
  selectedId,
  onSelect,
  onToggleNode,
  onAddChild,
  onRequestDelete,
}: BlockTreeProps) {
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
                onClick={() => onSelect(block.id)}
              >
                <div
                  className="p-1 hover:bg-zinc-700 rounded mr-1"
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleNode(block.id);
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
                    onAddChild(block.id);
                  }}
                >
                  <Plus size={14} />
                </button>
                <button
                  className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRequestDelete(block.id);
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

  return renderTree(null);
}
