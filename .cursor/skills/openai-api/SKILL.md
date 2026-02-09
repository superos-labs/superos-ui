# OpenAI + Next.js 16 Development Standards (Feb 2026)

## 🤖 Model Inventory & Selection

- **GPT-5.3-Codex:** Use for all coding, architectural tasks, and complex agentic workflows. Supports `computer_use` and high-fidelity reasoning.
- **GPT-5.2 (Thinking):** Use for tasks requiring deep logic, multi-step math, or complex debugging. Toggle `reasoning_effort: "high"`.
- **GPT-5-mini:** The default for UI completions, lightweight data transformations, and high-velocity streaming.
- **Legacy Note:** **GPT-4o** and **o1-mini** are deprecated. Do not use for new features.

---

## 📡 OpenAI API Architecture: The Responses API

The **Assistants API** is deprecated (shutdown: Aug 2026). All new development must use the **Responses API** (`/v1/responses`).

### Core Primitives

1. **Conversations:** Use `openai.conversations.create()` to generate a `conversation_id`. This replaces "Threads."
2. **Responses:** The single execution unit. Use `store: true` to persist context automatically.
3. **Items:** Input/Output units. Can be `input_text`, `output_text`, or `tool_call`.
4. **Chaining:** Use `previous_response_id` to link responses without resending the whole history (80% cost reduction via automated caching).

---

## 🏗 Next.js 16 Integration Standards

### 1. Build & Runtime

- **Turbopack:** Standard bundler. Avoid custom Webpack configs unless necessary.
- **React Compiler:** Fully stable. Do not use `useMemo` or `useCallback` unless manual optimization is required for external libraries.
- **Server Actions:** The primary method for data mutations. Use the `useActionState` hook for form handling.

### 2. Implementation Pattern (Vercel AI SDK 6)

Always use **AI SDK 6** for its `ToolLoopAgent` abstraction.

```typescript
// app/api/chat/route.ts
import { openai } from "@ai-sdk/openai";
import { streamText, ToolLoopAgent } from "ai";

export async function POST(req: Request) {
  const { messages, conversationId } = await req.json();

  // 1. Define the Agent
  const agent = new ToolLoopAgent({
    model: openai.responses("gpt-5.3-codex"),
    instructions: "You are a Senior Next.js Architect.",
    tools: {
      webSearch: openai.tools.webSearch(),
      fileSearch: openai.tools.fileSearch(),
    },
    // Server-side persistence via Responses API
    experimental_persistence: {
      id: conversationId,
      store: true,
    },
  });

  // 2. Execute with Agentic Autonomy
  const result = await agent.stream({
    prompt: messages[messages.length - 1].content,
    maxSteps: 10, // Allow the agent to loop through tools
  });

  return result.toDataStreamResponse();
}
```

---

## 🛠 Tooling & Diagnostics

- **Next DevTools MCP:** When debugging, ensure the `next-devtools-mcp` package is active. It allows the model to read server-side logs and browser console errors directly.
- **Structured Outputs:** Always define tool parameters and response schemas using **Zod**. The API now guarantees 100% schema adherence for GPT-5 series models.

---

## ✅ Best Practices (Always Follow)

- **Persistence:** Always set `store: true` in Response objects to leverage OpenAI’s server-side memory.
- **Streaming:** Always use `streamText` or `streamObject` for UI responsiveness.
- **Environment:** Access `OPENAI_API_KEY` only in `route.ts` or `actions.ts`. Never use `NEXT_PUBLIC_`.
- **Caching:** Use the new Next.js 16 `revalidateTag()` for clearing AI-generated content from the cache.

## ❌ Anti-Patterns (Avoid)

- **Don't** use the legacy Chat Completions API (`/v1/chat/completions`) for multi-turn sessions.
- **Don't** manually manage message arrays in `localStorage`; use the `conversation_id` primitive.
- **Don't** use `useEffect` for data fetching; use Server Components or the `use` hook.

## Environment Template

Add this to `.env.local`. Note the shift toward project-based organization for AI resources.

```bash
# OpenAI Configuration (Feb 2026 Standard)
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_ORG_ID=org-your-id

# Next.js AI Settings
NEXT_PUBLIC_AI_STREAMING_TIMEOUT=15000

# Store conversation IDs in your DB (recommended for GPT-5 persistence)
DATABASE_URL="postgresql://..."

# Optimization: automatic prompt caching (enabled by default in 2026)
OPENAI_ENABLE_PROMPT_CACHING=true
```

## Agentic Hook: `hooks/use-ai-agent.ts`

This hook abstracts the complexity of maintaining a `conversation_id`. In the Responses API era, the client does not send the full history. It sends the ID and lets the server handle context retrieval.

```ts
"use client";

import { useChat } from "ai/react";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";

export function useAiAgent(initialId?: string) {
  // Persistence: fetch existing conversation ID or generate a new one
  const [conversationId] = useState(() => initialId || uuidv4());

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } =
    useChat({
      api: "/api/chat",
      body: {
        conversationId, // Sent with every request to maintain server-side state
      },
      // React 19 optimized: automatic transition handling
      onResponse: (response) => {
        if (!response.ok) {
          console.error("Agent failed to initialize response stream.");
        }
      },
    });

  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    error,
    conversationId,
  };
}
```

## Backend Persisted Route: `app/api/chat/route.ts`

This route relies on the Responses API persistence layer. By passing the `conversationId`, the API retrieves and appends prior context automatically.

```ts
import { openai } from "@ai-sdk/openai";
import { streamText } from "ai";

export const runtime = "edge"; // Max speed for Feb 2026 edge runtimes

export async function POST(req: Request) {
  const { messages, conversationId } = await req.json();
  const lastMessage = messages[messages.length - 1];

  const result = await streamText({
    model: openai.responses("gpt-5.3-codex"),
    messages: [lastMessage], // Only the latest message is sent
    experimental_persistence: {
      id: conversationId,
      store: true, // The Responses API handles the rest server-side
    },
    tools: {
      // Standard 2026 toolset
      search: openai.tools.webSearch(),
      calculate: {
        description: "Perform complex math with high-precision reasoning",
        parameters: {
          // Zod schema goes here
        },
      },
    },
    maxSteps: 5, // Allow autonomous tool usage
  });

  return result.toDataStreamResponse();
}
```

## Implementation Example: `app/chat/page.tsx`

A clean, minimal UI built on top of the agentic hook.

```tsx
import { useAiAgent } from "@/hooks/use-ai-agent";

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } =
    useAiAgent();

  return (
    <main className="max-w-2xl mx-auto p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">GPT-5.3 Architect Agent</h1>
        <p className="text-sm opacity-50">Context persisted server-side</p>
      </header>

      <div className="space-y-4 mb-24">
        {messages.map((m) => (
          <div
            key={m.id}
            className={
              "p-4 rounded-lg " +
              (m.role === "user" ? "bg-zinc-100" : "bg-blue-50")
            }
          >
            <span className="font-bold block mb-1">
              {m.role === "user" ? "You" : "Agent"}
            </span>
            {m.content}
          </div>
        ))}
        {isLoading && <div className="animate-pulse">Agent is thinking...</div>}
      </div>

      <form
        onSubmit={handleSubmit}
        className="fixed bottom-8 w-full max-w-2xl flex gap-2"
      >
        <input
          className="flex-1 p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={input}
          onChange={handleInputChange}
          placeholder="Describe your Next.js architecture..."
        />
        <button
          type="submit"
          className="bg-black text-white px-6 py-3 rounded-xl hover:opacity-90 transition-opacity"
        >
          Send
        </button>
      </form>
    </main>
  );
}
```

# OpenAI Model Catalog and Context Orchestration (Feb 2026)

The OpenAI model catalog for February 2026 has fully transitioned to the Responses API standard. The distinction between chat and agentic models has largely disappeared, as all GPT-5 series models now support native reasoning and autonomous tool loops by default.

---

## 🚀 The 2026 Model Catalog: Implementation Specs

| Model                  | Context Window | Best Use Case                        | Key Spec / Hidden Feature                                    |
| ---------------------- | -------------- | ------------------------------------ | ------------------------------------------------------------ |
| **GPT-5.3-Codex**      | 400,000        | Agentic software engineering         | Optimized for GB200 hardware; 25 percent faster agent loops. |
| **GPT-5.2 (Thinking)** | 196,000        | Complex logic and architecture       | High `reasoning_effort` default; supports compaction.        |
| **GPT-5.2 (Instant)**  | 128,000        | High-speed RAG and SaaS backends     | Sub-100 ms TTL; best performance to cost ratio.              |
| **o3-deep-research**   | 1,000,000      | Massive data synthesis               | Multi-hour autonomous loops; ignores `max_tokens`.           |
| **GPT-5-mini**         | 128,000        | Classification and simple extraction | $0.25 per 1M input tokens; native JSON Schema support.       |

---

## 🛠 Model-Specific Implementation Details

### GPT-5.3-Codex

Unlike earlier generations, this is a self-correcting model. In your API call, set:

```json
{
  "tools": [{ "type": "code_interpreter_v2" }]
}
```

This enables a sandbox with a persistent file system across turns.

### Reasoning Effort

For GPT-5.2 and above, use the `reasoning` object.

```json
{
  "reasoning": {
    "effort": "high",
    "summary": "detailed"
  }
}
```

The summary returns an encrypted thought-trace overview suitable for logging or audits.

### Structured Outputs

The legacy `response_format` field has been replaced in the Responses API by `text.format`.

```ts
text: {
  format: {
    type: "json_schema",
    strict: true,
    schema: z.lazy(() => YourZodSchema)
  }
}
```

---

## 🧠 Best Practices: Context Orchestration

In 2026, prompts are no longer stuffed with entire histories. Stateful orchestration via the Responses API is the standard.

### 1. Server-Side Persistence

Stop managing large message arrays on the client. Set `store: true` and only pass the `previous_response_id`.

**Why:** Payload sizes drop by roughly 90 percent and OpenAI can reuse latent K/V caches from prior reasoning steps.

```ts
const res = await openai.responses.create({
  model: "gpt-5.2-thinking",
  previous_response_id: "resp_987abc...",
  input: "What about the second point?",
});
```

### 2. Context Compaction

When a conversation approaches 100k tokens, do not prune manually. Use the `/responses/compact` endpoint.

This compresses assistant messages and tool outputs into a single latent item, preserving decisions and tone with minimal token cost.

### 3. Items Versus Messages

The Responses API uses an `input` array of items. An item may be a message, function call, or compaction artifact.

Best practice is to inspect `response.output[0].type`. If it equals `reasoning_step`, the UI should display a thinking state instead of an empty assistant bubble.

---

## ✍️ Prompt Writing for Agentic Models

Explicit step-by-step prompting is obsolete. GPT-5 models reason internally, and forcing reasoning often increases token usage without benefit.

### 1. Objective-Oriented Instructions

Define the outcome, not the path.

- Bad: First inspect files, then locate the bug, then fix it.
- Good: Fix the bug in `auth.ts` where tokens expire early. The task is complete only when `npm test` passes and the fix is visible in the build log.

### 2. Tool-Calling Autonomy

Grant permission to fail and recover.

Include a recovery protocol in developer instructions, for example: if a tool call fails, attempt up to three alternative approaches before escalating to a human.

### 3. Using the Developer Role

The system role is legacy. Use `role: "developer"` for core instructions. This role has higher priority in the attention stack and is more resilient against later user overrides.
