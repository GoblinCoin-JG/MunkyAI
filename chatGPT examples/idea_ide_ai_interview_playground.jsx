import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AppWindow,
  Bot,
  CheckCircle2,
  ChevronRight,
  Circle,
  LayoutPanelLeft,
  ListChecks,
  MessageSquareMore,
  PanelsTopLeft,
  Send,
  Sparkles,
  SplitSquareHorizontal,
  Wand2,
} from "lucide-react";

const scenario = {
  project: "Idea IDE for app planning",
  aiSummary:
    "I’m helping scope a new app. Instead of forcing the user to answer a pile of questions in one chat box, I want to test interfaces that make AI interviews feel structured, visual, and low-friction.",
  questions: [
    {
      id: "goal",
      title: "Primary outcome",
      type: "textarea",
      prompt: "What is the main job this app should do for the user on day one?",
      placeholder:
        "Help users get their app idea out quickly, reduce blank-page syndrome, and organize the idea into a structured tree...",
      hint: "Aim for one clear sentence plus 2–3 supporting details.",
    },
    {
      id: "audience",
      title: "Target user",
      type: "chips",
      prompt: "Who is this for first?",
      options: ["Solo devs", "Writers", "Founders", "Students", "Designers"],
      hint: "Choose one or two to keep the first version focused.",
    },
    {
      id: "flow",
      title: "Preferred AI behavior",
      type: "single",
      prompt: "How should the AI guide the session?",
      options: [
        "One focused question at a time",
        "Grouped questions by topic",
        "Proposed answers with quick edits",
        "Mixed mode depending on confidence",
      ],
      hint: "This choice affects cognitive load more than almost anything else.",
    },
    {
      id: "outputs",
      title: "Expected outputs",
      type: "multi",
      prompt: "What should the AI build while interviewing the user?",
      options: [
        "Sectioned design doc",
        "Feature tree",
        "Open questions queue",
        "Decision log",
        "Next-step checklist",
      ],
      hint: "Pick the artifacts that make the conversation feel productive.",
    },
  ],
};

const presetAnswers = {
  goal:
    "The app should help a user turn a vague app idea into a structured plan without making them stare at a blank page. AI should guide the process, keep context organized, and produce scaffolding the user can refine.",
  audience: ["Solo devs", "Founders"],
  flow: "Mixed mode depending on confidence",
  outputs: ["Sectioned design doc", "Feature tree", "Decision log", "Open questions queue"],
};

const viewOptions = [
  {
    id: "chat",
    label: "Chat + inline cards",
    icon: MessageSquareMore,
    blurb: "Closest to today’s AI chat, but each question becomes a structured card instead of freeform text chaos.",
  },
  {
    id: "board",
    label: "Question board",
    icon: LayoutPanelLeft,
    blurb: "A kanban-like surface where the user answers grouped AI prompts in parallel.",
  },
  {
    id: "split",
    label: "Interview split view",
    icon: SplitSquareHorizontal,
    blurb: "AI asks on the left, the live project scaffold updates on the right as answers are filled in.",
  },
  {
    id: "wizard",
    label: "Guided flow",
    icon: ListChecks,
    blurb: "One question at a time with confidence and progress cues to reduce overwhelm.",
  },
];

function cx(...classes) {
  return classes.filter(Boolean).join(" ");
}

function TinyLabel({ children }) {
  return <div className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{children}</div>;
}

function Panel({ title, subtitle, right, children, className = "" }) {
  return (
    <div className={cx("rounded-xl border border-zinc-800 bg-zinc-900/50", className)}>
      <div className="flex items-start justify-between gap-3 border-b border-zinc-800 p-4">
        <div>
          <div className="text-sm font-bold tracking-tight text-zinc-100">{title}</div>
          {subtitle ? <div className="mt-1 text-xs text-zinc-400">{subtitle}</div> : null}
        </div>
        {right}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function Chip({ active, children, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cx(
        "rounded-md border px-2.5 py-1.5 text-xs transition-colors",
        active
          ? "border-blue-400/30 bg-blue-400/10 text-blue-400"
          : "border-zinc-800 bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700"
      )}
    >
      {children}
    </button>
  );
}

function SimulatedResponse({ question, value, setValue }) {
  if (question.type === "textarea") {
    return (
      <div className="space-y-2">
        <textarea
          value={value || ""}
          onChange={(e) => setValue(e.target.value)}
          placeholder={question.placeholder}
          className="min-h-[124px] w-full rounded-lg border border-zinc-700 bg-zinc-900/70 p-3 text-sm text-zinc-100 outline-none transition-all placeholder:text-zinc-500 focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20"
        />
        <div className="text-[11px] text-zinc-500">{question.hint}</div>
      </div>
    );
  }

  if (question.type === "chips") {
    const current = Array.isArray(value) ? value : [];
    return (
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {question.options.map((opt) => {
            const active = current.includes(opt);
            return (
              <Chip
                key={opt}
                active={active}
                onClick={() =>
                  setValue(active ? current.filter((x) => x !== opt) : [...current, opt])
                }
              >
                {opt}
              </Chip>
            );
          })}
        </div>
        <div className="text-[11px] text-zinc-500">{question.hint}</div>
      </div>
    );
  }

  if (question.type === "single") {
    return (
      <div className="space-y-2">
        {question.options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              onClick={() => setValue(opt)}
              className={cx(
                "flex w-full items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors",
                active
                  ? "border-blue-400/30 bg-blue-400/10 text-blue-300"
                  : "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800"
              )}
            >
              {active ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              <span>{opt}</span>
            </button>
          );
        })}
        <div className="text-[11px] text-zinc-500">{question.hint}</div>
      </div>
    );
  }

  if (question.type === "multi") {
    const current = Array.isArray(value) ? value : [];
    return (
      <div className="space-y-2">
        {question.options.map((opt) => {
          const active = current.includes(opt);
          return (
            <button
              key={opt}
              onClick={() =>
                setValue(active ? current.filter((x) => x !== opt) : [...current, opt])
              }
              className={cx(
                "flex w-full items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors",
                active
                  ? "border-blue-400/30 bg-blue-400/10 text-blue-300"
                  : "border-zinc-800 bg-zinc-900/60 text-zinc-300 hover:bg-zinc-800"
              )}
            >
              {active ? <CheckCircle2 className="h-4 w-4" /> : <Circle className="h-4 w-4" />}
              <span>{opt}</span>
            </button>
          );
        })}
        <div className="text-[11px] text-zinc-500">{question.hint}</div>
      </div>
    );
  }

  return null;
}

function AppScaffold({ answers }) {
  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
        <TinyLabel>Project goal</TinyLabel>
        <div className="mt-2 text-sm leading-6 text-zinc-300">
          {answers.goal || "Waiting for the user to define the primary outcome..."}
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
          <TinyLabel>Primary audience</TinyLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            {(answers.audience || []).length ? (
              answers.audience.map((item) => (
                <span
                  key={item}
                  className="rounded-md border border-blue-400/30 bg-blue-400/10 px-2 py-1 text-xs text-blue-400"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-sm text-zinc-500">No audience selected yet</span>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
          <TinyLabel>AI interaction mode</TinyLabel>
          <div className="mt-2 text-sm text-zinc-300">
            {answers.flow || "No guidance pattern selected yet"}
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-950/70 p-3">
        <TinyLabel>Generated artifacts</TinyLabel>
        <div className="mt-2 flex flex-wrap gap-2">
          {(answers.outputs || []).length ? (
            answers.outputs.map((item) => (
              <span
                key={item}
                className="rounded-md border border-green-400/30 bg-green-400/10 px-2 py-1 text-xs text-green-400"
              >
                {item}
              </span>
            ))
          ) : (
            <span className="text-sm text-zinc-500">No outputs chosen yet</span>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3">
        <TinyLabel>AI interpretation</TinyLabel>
        <div className="mt-2 text-sm leading-6 text-zinc-300">
          This concept works best if the interface avoids giant freeform reply boxes. The strongest pattern so far is
          a hybrid interview: structured answer widgets for the current topic, with a live scaffold updating beside
          the conversation.
        </div>
      </div>
    </div>
  );
}

function ChatView({ answers, setAnswer }) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg border border-blue-400/30 bg-blue-400/10 p-2 text-blue-400">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <TinyLabel>AI interviewer</TinyLabel>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300">{scenario.aiSummary}</p>
          </div>
        </div>
      </div>

      {scenario.questions.map((q, i) => (
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="rounded-xl border border-zinc-800 bg-zinc-900/50"
        >
          <div className="border-b border-zinc-800 p-4">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-blue-400" />
              <TinyLabel>Question {i + 1}</TinyLabel>
            </div>
            <div className="mt-2 text-sm font-medium text-zinc-100">{q.prompt}</div>
          </div>
          <div className="p-4">
            <SimulatedResponse question={q} value={answers[q.id]} setValue={(v) => setAnswer(q.id, v)} />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function BoardView({ answers, setAnswer }) {
  return (
    <div className="grid gap-4 xl:grid-cols-2">
      {scenario.questions.map((q, i) => (
        <motion.div
          key={q.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.03 }}
        >
          <Panel
            title={q.title}
            subtitle={q.prompt}
            right={<span className="rounded-md border border-yellow-400/30 bg-yellow-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-yellow-400">Open</span>}
          >
            <SimulatedResponse question={q} value={answers[q.id]} setValue={(v) => setAnswer(q.id, v)} />
          </Panel>
        </motion.div>
      ))}
    </div>
  );
}

function SplitView({ answers, setAnswer }) {
  const activeQuestion = scenario.questions.find((q) => !answers[q.id]) || scenario.questions[0];
  return (
    <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
      <Panel
        title="Live interview"
        subtitle="The AI focuses on the current question, while prior answers remain compactly visible below."
        right={<div className="rounded-md border border-blue-400/30 bg-blue-400/10 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-blue-400">Active</div>}
      >
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
          <TinyLabel>Current AI prompt</TinyLabel>
          <div className="mt-2 text-base font-medium text-zinc-100">{activeQuestion.prompt}</div>
          <div className="mt-4">
            <SimulatedResponse
              question={activeQuestion}
              value={answers[activeQuestion.id]}
              setValue={(v) => setAnswer(activeQuestion.id, v)}
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <TinyLabel>Question queue</TinyLabel>
          {scenario.questions.map((q) => {
            const complete = Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : Boolean(answers[q.id]);
            return (
              <div
                key={q.id}
                className={cx(
                  "flex items-center justify-between rounded-lg border p-3",
                  q.id === activeQuestion.id
                    ? "border-blue-400/30 bg-blue-400/10"
                    : "border-zinc-800 bg-zinc-900/50"
                )}
              >
                <div>
                  <div className="text-sm text-zinc-200">{q.title}</div>
                  <div className="text-[11px] text-zinc-500">{q.prompt}</div>
                </div>
                {complete ? (
                  <CheckCircle2 className="h-4 w-4 text-green-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-zinc-500" />
                )}
              </div>
            );
          })}
        </div>
      </Panel>

      <Panel
        title="Live scaffold"
        subtitle="This side demonstrates the payoff: the conversation is always producing visible structure."
        right={<Sparkles className="h-4 w-4 text-blue-400" />}
      >
        <AppScaffold answers={answers} />
      </Panel>
    </div>
  );
}

function WizardView({ answers, setAnswer }) {
  const [index, setIndex] = useState(0);
  const q = scenario.questions[index];
  const progress = ((index + 1) / scenario.questions.length) * 100;
  const answered = Array.isArray(answers[q.id]) ? answers[q.id].length > 0 : Boolean(answers[q.id]);

  return (
    <Panel
      title="Focused interview flow"
      subtitle="This pattern reduces cognitive load by asking for one decision at a time."
      right={<div className="text-xs text-zinc-500">{index + 1} / {scenario.questions.length}</div>}
    >
      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Session progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-zinc-800">
            <motion.div className="h-full bg-blue-500" animate={{ width: `${progress}%` }} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.18 }}
            className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
          >
            <TinyLabel>{q.title}</TinyLabel>
            <div className="mt-2 text-lg font-semibold tracking-tight text-zinc-100">{q.prompt}</div>
            <div className="mt-4">
              <SimulatedResponse question={q} value={answers[q.id]} setValue={(v) => setAnswer(q.id, v)} />
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-between border-t border-zinc-800 pt-4">
          <button
            onClick={() => setIndex((i) => Math.max(0, i - 1))}
            className="rounded-md border border-zinc-800 bg-zinc-800 px-3 py-2 text-sm text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            Back
          </button>
          <div className="text-[11px] text-zinc-500">
            {answered ? "This answer is filled in." : "Answer this, or skip to test the pacing."}
          </div>
          <button
            onClick={() => setIndex((i) => Math.min(scenario.questions.length - 1, i + 1))}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-500"
          >
            Next
          </button>
        </div>
      </div>
    </Panel>
  );
}

export default function IdeaIdeAiInterviewPlayground() {
  const [view, setView] = useState("split");
  const [answers, setAnswers] = useState(presetAnswers);

  const completion = useMemo(() => {
    const completed = scenario.questions.filter((q) => {
      const value = answers[q.id];
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    }).length;
    return Math.round((completed / scenario.questions.length) * 100);
  }, [answers]);

  const setAnswer = (id, value) => setAnswers((prev) => ({ ...prev, [id]: value }));

  const activeMeta = viewOptions.find((v) => v.id === view);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 selection:bg-blue-500/30">
      <style>{`
        * { scrollbar-width: thin; scrollbar-color: #27272a transparent; }
        *::-webkit-scrollbar { width: 6px; height: 6px; }
        *::-webkit-scrollbar-track { background: transparent; }
        *::-webkit-scrollbar-thumb { background: #27272a; border-radius: 10px; }
        *::-webkit-scrollbar-thumb:hover { background: #3f3f46; }
      `}</style>

      <div className="grid min-h-screen grid-cols-1 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="border-r border-zinc-800 bg-zinc-900/50">
          <div className="border-b border-zinc-800 p-4">
            <div className="flex items-center gap-2 text-zinc-100">
              <AppWindow className="h-4 w-4 text-blue-400" />
              <div className="text-sm font-bold tracking-tight">AI Interview Playground</div>
            </div>
            <div className="mt-2 text-xs leading-5 text-zinc-400">
              A canvas prototype for experimenting with richer AI question-and-answer flows in your Idea IDE.
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div>
              <TinyLabel>Scenario</TinyLabel>
              <div className="mt-2 rounded-lg border border-zinc-800 bg-zinc-950/70 p-3 text-sm text-zinc-300">
                {scenario.project}
              </div>
            </div>

            <div>
              <TinyLabel>Interaction patterns</TinyLabel>
              <div className="mt-2 space-y-2">
                {viewOptions.map((option) => {
                  const Icon = option.icon;
                  const active = view === option.id;
                  return (
                    <button
                      key={option.id}
                      onClick={() => setView(option.id)}
                      className={cx(
                        "group w-full rounded-lg border p-3 text-left transition-all",
                        active
                          ? "border-zinc-700 bg-zinc-800 text-blue-400"
                          : "border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:bg-zinc-800"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <div className="text-sm font-medium">{option.label}</div>
                      </div>
                      <div className="mt-2 text-[11px] leading-5 text-zinc-500">{option.blurb}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <main className="overflow-auto">
          <div className="border-b border-zinc-800 bg-zinc-900/30 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <TinyLabel>Active concept</TinyLabel>
                <div className="mt-1 text-xl font-bold tracking-tight text-white">{activeMeta?.label}</div>
                <div className="mt-1 max-w-3xl text-sm text-zinc-400">{activeMeta?.blurb}</div>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-3 py-2 text-xs text-zinc-400">
                <PanelsTopLeft className="h-4 w-4 text-blue-400" />
                Structured AI UX prototype
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 xl:p-8">
            {view === "chat" && <ChatView answers={answers} setAnswer={setAnswer} />}
            {view === "board" && <BoardView answers={answers} setAnswer={setAnswer} />}
            {view === "split" && <SplitView answers={answers} setAnswer={setAnswer} />}
            {view === "wizard" && <WizardView answers={answers} setAnswer={setAnswer} />}
          </div>
        </main>

        <aside className="border-l border-zinc-800 bg-zinc-900/50">
          <div className="border-b border-zinc-800 p-4">
            <div className="flex items-center gap-2 text-sm font-bold tracking-tight text-zinc-100">
              <Wand2 className="h-4 w-4 text-blue-400" />
              Evaluation notes
            </div>
            <div className="mt-2 text-xs leading-5 text-zinc-400">
              Use this side to observe what each pattern makes easier or harder.
            </div>
          </div>

          <div className="space-y-4 p-4">
            <Panel title="Quick metrics" subtitle="Simple signals you can compare while testing." className="bg-zinc-950/30">
              <div className="space-y-3 text-sm text-zinc-300">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Completion</span>
                  <span className="text-blue-400">{completion}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Questions</span>
                  <span>{scenario.questions.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Freeform burden</span>
                  <span className="text-green-400">Low</span>
                </div>
              </div>
            </Panel>

            <Panel title="What to look for" subtitle="Signals that a pattern is working.">
              <ul className="space-y-2 text-sm text-zinc-300">
                <li>Does the user know what to do instantly?</li>
                <li>Can they answer without formatting anxiety?</li>
                <li>Do they feel progress after every response?</li>
                <li>Can the AI visibly turn answers into structure?</li>
              </ul>
            </Panel>

            <Panel title="Current recommendation" subtitle="Based on this prototype exploration.">
              <div className="rounded-lg border border-purple-400/30 bg-purple-400/10 p-3 text-sm leading-6 text-zinc-200">
                The split interview view feels strongest for an Idea IDE: one active AI prompt, rich response widgets,
                and a live scaffold panel that proves the conversation is building something real.
              </div>
            </Panel>

            <button
              onClick={() => setAnswers(presetAnswers)}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-blue-600 px-3 py-2 text-sm text-white transition-colors hover:bg-blue-500"
            >
              <Send className="h-4 w-4" />
              Reset sample answers
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}
