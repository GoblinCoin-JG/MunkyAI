import { ThinkingBlock } from '../types';

export function collectDescendantIds(
  blocks: ThinkingBlock[],
  projectId: string,
  rootId: string,
): Set<string> {
  const toDelete = new Set<string>([rootId]);

  const walk = (parentId: string) => {
    blocks
      .filter((block) => block.projectId === projectId && block.parentId === parentId)
      .forEach((child) => {
        toDelete.add(child.id);
        walk(child.id);
      });
  };

  walk(rootId);
  return toDelete;
}
