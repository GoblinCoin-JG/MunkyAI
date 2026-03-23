import { useEffect, useMemo, useState } from 'react';
import { INITIAL_BLOCKS, INITIAL_PROJECT_ID, INITIAL_PROJECTS, STORAGE_KEYS } from '../constants';
import { ideationAiService } from '../services/ideationAiService';
import {
  AiOutput,
  ClarifyBoard,
  ClarifyQuestionCard,
  ClarifyQuestionDraft,
  ExpandAspectCard,
  ExpandAspectDraft,
  ExpandBoard,
  QuestionCardType,
  Suggestion,
  ThinkingBlock,
  Project,
} from '../types';
import { collectDescendantIds } from '../utils/blockTree';
import { createId } from '../../../utils/createId';
import { downloadTextFile } from '../../../utils/downloadTextFile';
import { useResizablePanels } from './useResizablePanels';

function normalizeQuestionType(value: string): QuestionCardType {
  if (value === 'single' || value === 'multi') {
    return value;
  }

  return 'textarea';
}

function buildQuestionCard(draft: ClarifyQuestionDraft, source: 'ai' | 'custom'): ClarifyQuestionCard {
  const type = normalizeQuestionType(draft.type);
  const options = Array.isArray(draft.options)
    ? draft.options.map((option) => option.trim()).filter(Boolean)
    : [];

  return {
    id: createId(),
    title: draft.title?.trim() || 'Untitled question',
    prompt: draft.prompt?.trim() || 'Add question prompt',
    type,
    options: type === 'textarea' ? [] : options,
    answer: type === 'multi' ? [] : '',
    note: '',
    source,
  };
}

function buildExpandCard(draft: ExpandAspectDraft, source: 'ai' | 'custom'): ExpandAspectCard {
  return {
    id: createId(),
    title: draft.title?.trim() || 'Untitled aspect',
    detail: draft.detail?.trim() || 'Add detail for this expansion aspect.',
    context: '',
    source,
  };
}

function isAnswered(card: ClarifyQuestionCard): boolean {
  if (card.type === 'multi') {
    return Array.isArray(card.answer) && card.answer.length > 0;
  }

  return typeof card.answer === 'string' && card.answer.trim().length > 0;
}

function serializeAnswer(card: ClarifyQuestionCard): string {
  if (card.type === 'multi' && Array.isArray(card.answer)) {
    return card.answer.join(', ');
  }

  return typeof card.answer === 'string' ? card.answer : '';
}

function hasExpandDetail(card: ExpandAspectCard): boolean {
  return card.detail.trim().length > 0;
}

export function useIdeationWorkspace() {
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.projects);
    return saved ? JSON.parse(saved) : INITIAL_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.activeProject);
    return saved || INITIAL_PROJECT_ID;
  });

  const [blocks, setBlocks] = useState<ThinkingBlock[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.blocks);
    return saved ? JSON.parse(saved) : INITIAL_BLOCKS;
  });

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isSubmittingExpandBoard, setIsSubmittingExpandBoard] = useState(false);
  const [isSubmittingClarifyBoard, setIsSubmittingClarifyBoard] = useState(false);
  const [aiOutput, setAiOutput] = useState<AiOutput | null>(null);
  const [expandBoard, setExpandBoard] = useState<ExpandBoard | null>(null);
  const [expandBoardError, setExpandBoardError] = useState<string | null>(null);
  const [clarifyBoard, setClarifyBoard] = useState<ClarifyBoard | null>(null);
  const [clarifyBoardError, setClarifyBoardError] = useState<string | null>(null);
  const [artifactDraft, setArtifactDraft] = useState<string | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['1']));
  const [deleteConfirmationId, setDeleteConfirmationId] = useState<string | null>(null);
  const [deleteProjectConfirmationId, setDeleteProjectConfirmationId] = useState<string | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [newProjectIdea, setNewProjectIdea] = useState('');

  const {
    leftWidth,
    rightWidth,
    isResizingLeft,
    isResizingRight,
    startResizingLeft,
    startResizingRight,
    setLeftWidth,
    setRightWidth,
  } = useResizablePanels();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
    localStorage.setItem(STORAGE_KEYS.activeProject, activeProjectId);
    localStorage.setItem(STORAGE_KEYS.blocks, JSON.stringify(blocks));
    localStorage.setItem(STORAGE_KEYS.leftWidth, String(leftWidth));
    localStorage.setItem(STORAGE_KEYS.rightWidth, String(rightWidth));
  }, [projects, activeProjectId, blocks, leftWidth, rightWidth]);

  const projectBlocks = useMemo(
    () => blocks.filter((block) => block.projectId === activeProjectId),
    [blocks, activeProjectId],
  );

  const selectedBlock = useMemo(
    () => projectBlocks.find((block) => block.id === selectedId) || null,
    [projectBlocks, selectedId],
  );

  const clarifyBoardUnansweredIds = useMemo(() => {
    if (!clarifyBoard) {
      return [];
    }

    return clarifyBoard.cards.filter((card) => !isAnswered(card)).map((card) => card.id);
  }, [clarifyBoard]);

  const expandBoardIncompleteIds = useMemo(() => {
    if (!expandBoard) {
      return [];
    }

    return expandBoard.cards.filter((card) => !hasExpandDetail(card)).map((card) => card.id);
  }, [expandBoard]);

  const expandBoardCompletion = useMemo(() => {
    if (!expandBoard || expandBoard.cards.length === 0) {
      return 0;
    }

    const detailedCount = expandBoard.cards.filter((card) => hasExpandDetail(card)).length;
    return Math.round((detailedCount / expandBoard.cards.length) * 100);
  }, [expandBoard]);

  const clarifyBoardCompletion = useMemo(() => {
    if (!clarifyBoard || clarifyBoard.cards.length === 0) {
      return 0;
    }

    const answeredCount = clarifyBoard.cards.filter((card) => isAnswered(card)).length;
    return Math.round((answeredCount / clarifyBoard.cards.length) * 100);
  }, [clarifyBoard]);

  const filteredBlocks = useMemo(() => {
    if (!searchQuery) {
      return projectBlocks;
    }

    return projectBlocks.filter((block) =>
      block.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [projectBlocks, searchQuery]);

  const createProject = async () => {
    if (!newProjectIdea.trim()) {
      return;
    }

    setIsAiLoading(true);

    try {
      const scaffold = await ideationAiService.generateProjectStructure(newProjectIdea);
      const newProjectId = createId();

      const newProject: Project = {
        id: newProjectId,
        name: scaffold.projectName,
        createdAt: Date.now(),
      };

      const rootBlockId = createId();
      const rootBlock: ThinkingBlock = {
        id: rootBlockId,
        projectId: newProjectId,
        parentId: null,
        title: scaffold.projectName,
        summary: newProjectIdea,
        content: '',
        tags: ['root'],
        maturityState: 'Exploratory',
      };

      const childBlocks: ThinkingBlock[] = scaffold.blocks.map((block) => ({
        id: createId(),
        projectId: newProjectId,
        parentId: rootBlockId,
        title: block.title,
        summary: block.summary,
        content: block.content,
        tags: block.tags,
        maturityState: 'Exploratory',
      }));

      setProjects((prev) => [...prev, newProject]);
      setBlocks((prev) => [...prev, rootBlock, ...childBlocks]);
      setActiveProjectId(newProjectId);
      setSelectedId(rootBlockId);
      setExpandedNodes(new Set([rootBlockId]));
      setShowNewProjectModal(false);
      setNewProjectIdea('');
    } catch (error) {
      console.error(error);
      alert('Failed to generate project structure.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const addBlock = (parentId: string | null = null) => {
    const newBlock: ThinkingBlock = {
      id: createId(),
      projectId: activeProjectId,
      parentId,
      title: 'New Block',
      summary: '',
      content: '',
      tags: [],
      maturityState: 'Exploratory',
    };

    setBlocks((prev) => [...prev, newBlock]);
    setSelectedId(newBlock.id);

    if (parentId) {
      setExpandedNodes((prev) => new Set(prev).add(parentId));
    }
  };

  const updateBlock = (id: string, updates: Partial<ThinkingBlock>) => {
    setBlocks((prev) => prev.map((block) => (block.id === id ? { ...block, ...updates } : block)));
  };

  const deleteBlock = (id: string) => {
    const toDelete = collectDescendantIds(blocks, activeProjectId, id);
    setBlocks((prev) => prev.filter((block) => !toDelete.has(block.id)));

    if (selectedId && toDelete.has(selectedId)) {
      setSelectedId(null);
    }

    setDeleteConfirmationId(null);
  };

  const deleteProject = (id: string) => {
    if (projects.length <= 1) {
      alert('You must have at least one project.');
      return;
    }

    const nextProject = projects.find((project) => project.id !== id);
    setProjects((prev) => prev.filter((project) => project.id !== id));
    setBlocks((prev) => prev.filter((block) => block.projectId !== id));

    if (activeProjectId === id && nextProject) {
      setActiveProjectId(nextProject.id);
      setSelectedId(null);
    }

    setDeleteProjectConfirmationId(null);
  };

  const toggleNode = (id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleAiAction = async (action: 'expand' | 'clarify' | 'suggest' | 'artifact') => {
    if (!selectedBlock) {
      return;
    }

    setIsAiLoading(true);
    setAiOutput(null);

    try {
      switch (action) {
        case 'expand': {
          const aspects = await ideationAiService.expandBlock(selectedBlock);
          const cards = aspects.map((aspect) => buildExpandCard(aspect, 'ai'));
          setExpandBoard({
            blockId: selectedBlock.id,
            cards,
          });
          setExpandBoardError(null);
          break;
        }
        case 'clarify': {
          const questions = await ideationAiService.clarifyBlock(selectedBlock);
          const cards = questions.map((question) => buildQuestionCard(question, 'ai'));
          setClarifyBoard({
            blockId: selectedBlock.id,
            cards,
          });
          setClarifyBoardError(null);
          break;
        }
        case 'suggest': {
          const suggestions = await ideationAiService.suggestChildren(selectedBlock);
          setAiOutput({ type: 'suggest', content: suggestions });
          break;
        }
        case 'artifact': {
          const children = projectBlocks.filter((block) => block.parentId === selectedBlock.id);
          const draft = await ideationAiService.generateArtifact(selectedBlock, children);
          setArtifactDraft(draft);
          break;
        }
      }
    } catch (error) {
      console.error(error);
      alert('AI Action failed. Check console.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const updateExpandCard = (cardId: string, updater: (card: ExpandAspectCard) => ExpandAspectCard) => {
    setExpandBoard((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        cards: prev.cards.map((card) => (card.id === cardId ? updater(card) : card)),
      };
    });
    setExpandBoardError(null);
  };

  const setExpandCardDetail = (cardId: string, detail: string) => {
    updateExpandCard(cardId, (card) => ({ ...card, detail }));
  };

  const setExpandCardContext = (cardId: string, context: string) => {
    updateExpandCard(cardId, (card) => ({ ...card, context }));
  };

  const deleteExpandCard = (cardId: string) => {
    setExpandBoard((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        cards: prev.cards.filter((card) => card.id !== cardId),
      };
    });
    setExpandBoardError(null);
  };

  const addCustomExpandCard = () => {
    const draft: ExpandAspectDraft = {
      title: 'Custom aspect',
      detail: 'Describe the additional detail you want to add here.',
    };

    setExpandBoard((prev) => {
      if (!selectedId) {
        return prev;
      }

      if (!prev || prev.blockId !== selectedId) {
        return {
          blockId: selectedId,
          cards: [buildExpandCard(draft, 'custom')],
        };
      }

      return {
        ...prev,
        cards: [...prev.cards, buildExpandCard(draft, 'custom')],
      };
    });
    setExpandBoardError(null);
  };

  const addAiExpandCard = async () => {
    if (!selectedBlock) {
      return;
    }

    const existingAspects =
      expandBoard?.cards.map((card) => ({
        title: card.title,
        detail: card.detail,
        context: card.context,
      })) ?? [];

    setIsAiLoading(true);

    try {
      const aspect = await ideationAiService.generateExpandAspect(selectedBlock, existingAspects);
      setExpandBoard((prev) => {
        if (!prev || prev.blockId !== selectedBlock.id) {
          return {
            blockId: selectedBlock.id,
            cards: [buildExpandCard(aspect, 'ai')],
          };
        }

        return {
          ...prev,
          cards: [...prev.cards, buildExpandCard(aspect, 'ai')],
        };
      });
      setExpandBoardError(null);
    } catch (error) {
      console.error(error);
      alert('Failed to generate additional expansion card.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const submitExpandBoard = async (): Promise<boolean> => {
    if (!selectedBlock || !selectedId || !expandBoard || expandBoard.blockId !== selectedId) {
      setExpandBoardError('Generate or create an expand board for the selected block first.');
      return false;
    }

    if (expandBoard.cards.length === 0) {
      setExpandBoardError('Add at least one expansion card before submitting.');
      return false;
    }

    const unresolvedCount = expandBoard.cards.filter((card) => !hasExpandDetail(card)).length;
    if (unresolvedCount > 0) {
      setExpandBoardError('Fill in all expansion card details before submit.');
      return false;
    }

    const payload = expandBoard.cards.map((card) => ({
      title: card.title,
      detail: card.detail.trim(),
      context: card.context.trim(),
    }));

    setIsSubmittingExpandBoard(true);

    try {
      const synthesis = await ideationAiService.synthesizeExpandBoard(selectedBlock, payload);
      updateBlock(selectedId, {
        summary: synthesis.summary,
        content: synthesis.content,
      });
      setExpandBoardError(null);
      setExpandBoard(null);
      return true;
    } catch (error) {
      console.error(error);
      setExpandBoardError('Failed to submit expansion cards and update the selected block.');
      return false;
    } finally {
      setIsSubmittingExpandBoard(false);
    }
  };

  const clearExpandBoard = () => {
    setExpandBoard(null);
    setExpandBoardError(null);
  };

  const updateQuestionCard = (cardId: string, updater: (card: ClarifyQuestionCard) => ClarifyQuestionCard) => {
    setClarifyBoard((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        cards: prev.cards.map((card) => (card.id === cardId ? updater(card) : card)),
      };
    });
    setClarifyBoardError(null);
  };

  const setQuestionCardAnswer = (cardId: string, answer: string | string[]) => {
    updateQuestionCard(cardId, (card) => ({
      ...card,
      answer: card.type === 'multi' ? (Array.isArray(answer) ? answer : []) : String(answer),
    }));
  };

  const setQuestionCardNote = (cardId: string, note: string) => {
    updateQuestionCard(cardId, (card) => ({ ...card, note }));
  };

  const addQuestionOption = (cardId: string, option: string) => {
    const normalizedOption = option.trim();
    if (!normalizedOption) {
      return;
    }

    updateQuestionCard(cardId, (card) => {
      if (card.type === 'textarea') {
        return card;
      }

      if (card.options.some((existing) => existing.toLowerCase() === normalizedOption.toLowerCase())) {
        return card;
      }

      return {
        ...card,
        options: [...card.options, normalizedOption],
      };
    });
  };

  const deleteQuestionCard = (cardId: string) => {
    setClarifyBoard((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        cards: prev.cards.filter((card) => card.id !== cardId),
      };
    });
    setClarifyBoardError(null);
  };

  const addCustomQuestionCard = () => {
    const draft: ClarifyQuestionDraft = {
      title: 'Custom question',
      prompt: 'Add your custom clarification prompt here.',
      type: 'textarea',
      options: [],
    };

    setClarifyBoard((prev) => {
      if (!selectedId) {
        return prev;
      }

      if (!prev || prev.blockId !== selectedId) {
        return {
          blockId: selectedId,
          cards: [buildQuestionCard(draft, 'custom')],
        };
      }

      return {
        ...prev,
        cards: [...prev.cards, buildQuestionCard(draft, 'custom')],
      };
    });
    setClarifyBoardError(null);
  };

  const addAiQuestionCard = async () => {
    if (!selectedBlock) {
      return;
    }

    const existingQuestions = clarifyBoard?.cards.map((card) => ({
      title: card.title,
      prompt: card.prompt,
    })) ?? [];

    setIsAiLoading(true);

    try {
      const question = await ideationAiService.generateClarifyQuestion(selectedBlock, existingQuestions);
      setClarifyBoard((prev) => {
        if (!prev || prev.blockId !== selectedBlock.id) {
          return {
            blockId: selectedBlock.id,
            cards: [buildQuestionCard(question, 'ai')],
          };
        }

        return {
          ...prev,
          cards: [...prev.cards, buildQuestionCard(question, 'ai')],
        };
      });
      setClarifyBoardError(null);
    } catch (error) {
      console.error(error);
      alert('Failed to generate additional question card.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const submitQuestionBoard = async () => {
    if (!selectedBlock || !selectedId || !clarifyBoard || clarifyBoard.blockId !== selectedId) {
      setClarifyBoardError('Generate or create a question board for the selected block first.');
      return;
    }

    if (clarifyBoard.cards.length === 0) {
      setClarifyBoardError('Add at least one question card before submitting.');
      return;
    }

    const unresolvedCount = clarifyBoard.cards.filter((card) => !isAnswered(card)).length;
    if (unresolvedCount > 0) {
      setClarifyBoardError('Answer all remaining question cards before submit.');
      return;
    }

    const payload = clarifyBoard.cards.map((card) => ({
      title: card.title,
      prompt: card.prompt,
      answer: serializeAnswer(card),
      note: card.note.trim(),
    }));

    setIsSubmittingClarifyBoard(true);

    try {
      const synthesis = await ideationAiService.synthesizeClarifyAnswers(selectedBlock, payload);
      updateBlock(selectedId, {
        summary: synthesis.summary,
        content: synthesis.content,
      });
      setClarifyBoardError(null);
      setClarifyBoard(null);
    } catch (error) {
      console.error(error);
      setClarifyBoardError('Failed to submit board and update the selected block.');
    } finally {
      setIsSubmittingClarifyBoard(false);
    }
  };

  const clearQuestionBoard = () => {
    setClarifyBoard(null);
    setClarifyBoardError(null);
  };

  const addSuggestedBlock = (suggestion: Suggestion) => {
    if (!selectedId) {
      return;
    }

    const newBlock: ThinkingBlock = {
      id: createId(),
      projectId: activeProjectId,
      parentId: selectedId,
      title: suggestion.title,
      summary: suggestion.description,
      content: '',
      tags: [],
      maturityState: 'Exploratory',
    };

    setBlocks((prev) => [...prev, newBlock]);
    setExpandedNodes((prev) => new Set(prev).add(selectedId));
  };

  const exportArtifact = (title: string) => {
    if (!artifactDraft) {
      return;
    }

    const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-artifact.md`;
    downloadTextFile(filename, artifactDraft, 'text/markdown');
  };

  return {
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
    setLeftWidth,
    setRightWidth,
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
    exportArtifact,
  };
}
