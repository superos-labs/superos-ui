/**
 * =============================================================================
 * File: goal-detail-notes-editor.tsx
 * =============================================================================
 *
 * Rich text editor for goal notes powered by Tiptap.
 *
 * Provides inline formatting (bold, italic), headings (H1, H2, H3),
 * lists (bullet, ordered), and collapsible toggle sections via a
 * bubble menu on text selection and a slash-command menu.
 *
 * -----------------------------------------------------------------------------
 * RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Render a Tiptap editor with configured extensions.
 * - Show a bubble menu for inline formatting on text selection.
 * - Show a slash-command menu for block-level actions.
 * - Emit structured JSON content on change.
 * - Match the borderless, minimal aesthetic of the goal detail view.
 *
 * -----------------------------------------------------------------------------
 * NON-RESPONSIBILITIES
 * -----------------------------------------------------------------------------
 * - Persisting notes.
 * - Managing goal state.
 *
 * -----------------------------------------------------------------------------
 * DESIGN NOTES
 * -----------------------------------------------------------------------------
 * - Uses StarterKit with a focused subset of extensions.
 * - Heading levels H1, H2, and H3 are available.
 * - Details (toggle) extension for collapsible content blocks.
 * - Slash commands implemented via a custom suggestion-style dropdown.
 * - Scoped to goal detail — not a shared component.
 *
 * -----------------------------------------------------------------------------
 * EXPORTS
 * -----------------------------------------------------------------------------
 * - GoalDetailNotesEditor
 * - GoalDetailNotesEditorProps
 */

"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import { BubbleMenu } from "@tiptap/react/menus";
import StarterKit from "@tiptap/starter-kit";
import { Markdown } from "@tiptap/markdown";
import { Details } from "@tiptap/extension-details";
import { DetailsSummary } from "@tiptap/extension-details";
import { DetailsContent } from "@tiptap/extension-details";
import Placeholder from "@tiptap/extension-placeholder";
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";
import type { JSONContent } from "@tiptap/react";
import { cn } from "@/lib/utils";
import {
  RiBold,
  RiItalic,
  RiH1,
  RiH2,
  RiH3,
  RiListUnordered,
  RiListOrdered2,
  RiArrowDownSLine,
} from "@remixicon/react";

// =============================================================================
// Types
// =============================================================================

export interface GoalDetailNotesEditorProps {
  /** Initial content — JSONContent from Tiptap or a legacy plain string */
  content: JSONContent | string;
  /** Called on every editor update with structured JSON */
  onChange?: (content: JSONContent) => void;
  /** Additional class names for the wrapper */
  className?: string;
}

// =============================================================================
// Slash Command Items
// =============================================================================

interface SlashCommandItem {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  command: (editor: ReturnType<typeof useEditor>) => void;
}

const SLASH_COMMANDS: SlashCommandItem[] = [
  {
    id: "heading1",
    label: "Heading 1",
    description: "Large heading",
    icon: RiH1,
    command: (editor) => {
      editor?.chain().focus().toggleHeading({ level: 1 }).run();
    },
  },
  {
    id: "heading2",
    label: "Heading 2",
    description: "Medium heading",
    icon: RiH2,
    command: (editor) => {
      editor?.chain().focus().toggleHeading({ level: 2 }).run();
    },
  },
  {
    id: "heading3",
    label: "Heading 3",
    description: "Small heading",
    icon: RiH3,
    command: (editor) => {
      editor?.chain().focus().toggleHeading({ level: 3 }).run();
    },
  },
  {
    id: "bulletList",
    label: "Bullet list",
    description: "Unordered list",
    icon: RiListUnordered,
    command: (editor) => {
      editor?.chain().focus().toggleBulletList().run();
    },
  },
  {
    id: "orderedList",
    label: "Numbered list",
    description: "Ordered list",
    icon: RiListOrdered2,
    command: (editor) => {
      editor?.chain().focus().toggleOrderedList().run();
    },
  },
  {
    id: "toggle",
    label: "Toggle",
    description: "Collapsible section",
    icon: RiArrowDownSLine,
    command: (editor) => {
      if (!editor) return;

      // Create the toggle and immediately set it to open
      editor.chain().focus().setDetails().run();

      // Find the just-created details node and toggle it open
      setTimeout(() => {
        const { state } = editor;
        const { $from } = state.selection;
        // Look for details node at or near cursor
        for (let d = $from.depth; d >= 0; d--) {
          const node = $from.node(d);
          if (node.type.name === "details") {
            const pos = $from.before(d);
            // Set open attribute to true
            editor
              .chain()
              .setNodeSelection(pos)
              .updateAttributes("details", { open: true })
              .setTextSelection(pos + 2) // Move cursor to summary
              .run();
            break;
          }
        }
      }, 0);
    },
  },
];

// =============================================================================
// Slash Command Extension
// =============================================================================

const slashCommandPluginKey = new PluginKey("slashCommand");

/**
 * Custom extension that listens for "/" input at the beginning of an empty
 * block or after whitespace, and manages a slash-command suggestion state.
 *
 * The actual dropdown UI is rendered by the React component below — this
 * extension manages the ProseMirror-level state (active, query, position).
 */
const SlashCommandExtension = Extension.create({
  name: "slashCommand",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: slashCommandPluginKey,
        state: {
          init() {
            return { active: false, query: "", from: 0 };
          },
          apply(tr, prev) {
            const meta = tr.getMeta(slashCommandPluginKey);
            if (meta) return meta;
            if (!prev.active) return prev;

            // If the document changed, update the query from the slash position
            if (tr.docChanged || tr.selectionSet) {
              const { from } = tr.selection;
              const mappedSlashFrom = tr.mapping.map(prev.from);
              const text = tr.doc.textBetween(mappedSlashFrom, from, "");
              // If user moved cursor away or deleted the slash, close
              if (from < mappedSlashFrom || !text.startsWith("/")) {
                return { active: false, query: "", from: 0 };
              }
              return {
                active: true,
                query: text.slice(1), // everything after the "/"
                from: mappedSlashFrom,
              };
            }
            return prev;
          },
        },
        props: {
          handleKeyDown(view, event) {
            const state = slashCommandPluginKey.getState(view.state);

            if (state?.active) {
              // Escape closes the menu
              if (event.key === "Escape") {
                view.dispatch(
                  view.state.tr.setMeta(slashCommandPluginKey, {
                    active: false,
                    query: "",
                    from: 0,
                  }),
                );
                return true;
              }
            }

            return false;
          },
          handleTextInput(view, from, _to, text) {
            if (text === "/") {
              // Check if at start of block or after whitespace
              const $pos = view.state.doc.resolve(from);
              const isStartOfBlock = $pos.parentOffset === 0;
              const textBefore = $pos.parent.textBetween(
                0,
                $pos.parentOffset,
                "",
              );
              const isAfterWhitespace =
                textBefore.length === 0 || textBefore.endsWith(" ");

              if (isStartOfBlock || isAfterWhitespace) {
                // Schedule activation after the "/" is inserted
                setTimeout(() => {
                  view.dispatch(
                    view.state.tr.setMeta(slashCommandPluginKey, {
                      active: true,
                      query: "",
                      from: from + 1, // position of the "/" character (after insertion)
                    }),
                  );
                }, 0);
              }
            }
            return false;
          },
          decorations(state) {
            // We use decorations only to trigger React re-renders;
            // actual UI is handled in the component.
            const pluginState = slashCommandPluginKey.getState(state);
            if (pluginState?.active) {
              return DecorationSet.create(state.doc, [
                Decoration.widget(pluginState.from, () => {
                  const span = document.createElement("span");
                  span.className = "slash-command-anchor";
                  return span;
                }),
              ]);
            }
            return DecorationSet.empty;
          },
        },
      }),
    ];
  },
});

// =============================================================================
// Slash Command Menu (React component)
// =============================================================================

interface SlashCommandMenuProps {
  editor: ReturnType<typeof useEditor>;
  className?: string;
}

function SlashCommandMenu({ editor, className }: SlashCommandMenuProps) {
  const [state, setState] = React.useState<{
    active: boolean;
    query: string;
    from: number;
  }>({ active: false, query: "", from: 0 });
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const menuRef = React.useRef<HTMLDivElement>(null);

  // Subscribe to plugin state changes
  React.useEffect(() => {
    if (!editor) return;

    const updateState = () => {
      const pluginState = slashCommandPluginKey.getState(editor.state);
      if (pluginState) {
        setState(pluginState);
      }
    };

    editor.on("transaction", updateState);
    return () => {
      editor.off("transaction", updateState);
    };
  }, [editor]);

  // Reset selection when query changes
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [state.query]);

  // Filter commands based on query
  const filteredCommands = React.useMemo(() => {
    if (!state.query) return SLASH_COMMANDS;
    const q = state.query.toLowerCase();
    return SLASH_COMMANDS.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) || cmd.id.toLowerCase().includes(q),
    );
  }, [state.query]);

  // Execute a command and clean up the slash text
  const executeCommand = React.useCallback(
    (item: SlashCommandItem) => {
      if (!editor) return;

      // Delete the "/" and query text
      const { from } = state;
      const to = editor.state.selection.from;
      editor
        .chain()
        .focus()
        .deleteRange({ from: from - 1, to }) // -1 to include the "/" itself
        .run();

      // Close the menu
      editor.view.dispatch(
        editor.state.tr.setMeta(slashCommandPluginKey, {
          active: false,
          query: "",
          from: 0,
        }),
      );

      // Execute the command
      item.command(editor);
    },
    [editor, state],
  );

  // Keyboard navigation
  React.useEffect(() => {
    if (!state.active || !editor) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((i) => (i + 1) % filteredCommands.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(
          (i) => (i - 1 + filteredCommands.length) % filteredCommands.length,
        );
      } else if (e.key === "Enter") {
        e.preventDefault();
        const item = filteredCommands[selectedIndex];
        if (item) executeCommand(item);
      }
    };

    // Capture phase to intercept before ProseMirror
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [state.active, editor, filteredCommands, selectedIndex, executeCommand]);

  // Position the menu relative to the slash-command-anchor decoration
  const [menuPos, setMenuPos] = React.useState<{
    top: number;
    left: number;
  } | null>(null);

  React.useEffect(() => {
    if (!state.active || !editor) {
      setMenuPos(null);
      return;
    }

    const updatePosition = () => {
      const coords = editor.view.coordsAtPos(state.from);
      const editorRect = editor.view.dom
        .closest(".goal-notes-editor-root")
        ?.getBoundingClientRect();
      if (coords && editorRect) {
        setMenuPos({
          top: coords.bottom - editorRect.top + 4,
          left: coords.left - editorRect.left,
        });
      }
    };

    updatePosition();
  }, [state.active, state.from, state.query, editor]);

  if (!state.active || filteredCommands.length === 0 || !menuPos) return null;

  return (
    <div
      ref={menuRef}
      className={cn(
        "absolute z-50 min-w-[200px] overflow-hidden rounded-lg border border-border bg-popover p-1 shadow-md animate-in fade-in-0 zoom-in-95",
        className,
      )}
      style={{ top: menuPos.top, left: menuPos.left }}
    >
      {filteredCommands.map((item, index) => {
        const Icon = item.icon;
        return (
          <button
            key={item.id}
            className={cn(
              "flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors",
              index === selectedIndex
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
            )}
            onMouseEnter={() => setSelectedIndex(index)}
            onMouseDown={(e) => {
              e.preventDefault(); // prevent editor blur
              executeCommand(item);
            }}
          >
            <Icon className="size-4 shrink-0" />
            <div className="flex flex-col">
              <span className="text-sm font-medium">{item.label}</span>
              <span className="text-xs text-muted-foreground/70">
                {item.description}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}

// =============================================================================
// Bubble Menu Toolbar
// =============================================================================

interface BubbleToolbarButtonProps {
  onClick: () => void;
  isActive: boolean;
  children: React.ReactNode;
  label: string;
}

function BubbleToolbarButton({
  onClick,
  isActive,
  children,
  label,
}: BubbleToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      className={cn(
        "flex size-7 items-center justify-center rounded-md transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-accent-foreground",
      )}
    >
      {children}
    </button>
  );
}

// =============================================================================
// Convert legacy plain string to Tiptap JSONContent
// =============================================================================

function normalizeContent(content: JSONContent | string): JSONContent {
  if (typeof content === "string") {
    if (!content) return { type: "doc", content: [{ type: "paragraph" }] };
    // Convert plain text lines to paragraphs
    return {
      type: "doc",
      content: content.split("\n").map((line) => ({
        type: "paragraph",
        content: line ? [{ type: "text", text: line }] : [],
      })),
    };
  }
  return content;
}

// =============================================================================
// Main Editor Component
// =============================================================================

export function GoalDetailNotesEditor({
  content,
  onChange,
  className,
}: GoalDetailNotesEditorProps) {
  const normalizedContent = React.useMemo(
    () => normalizeContent(content),
    [content], // Re-normalize when content prop changes (switching between goals)
  );

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        bulletList: {},
        orderedList: {},
        // Disable features outside scope
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        code: false,
        strike: false,
      }),
      Markdown,
      Details.configure({
        persist: true,
        openClassName: "is-open",
      }),
      DetailsSummary,
      DetailsContent,
      Placeholder.configure({
        placeholder: "Add notes or type / for commands...",
      }),
      SlashCommandExtension,
    ],
    content: normalizedContent,
    immediatelyRender: false,
    editable: !!onChange,
    onUpdate: ({ editor: e }) => {
      onChange?.(e.getJSON());
    },
  });

  // Update editor content when the prop changes (switching between goals)
  React.useEffect(() => {
    if (editor && !editor.isDestroyed) {
      const currentContent = editor.getJSON();
      // Only update if content actually changed to avoid unnecessary re-renders
      if (JSON.stringify(currentContent) !== JSON.stringify(normalizedContent)) {
        editor.commands.setContent(normalizedContent, { emitUpdate: false });
      }
    }
  }, [editor, normalizedContent]);

  return (
    <div
      className={cn("goal-notes-editor-root relative flex flex-col", className)}
    >
      {/* Bubble Menu — appears on text selection */}
      {editor && (
        <BubbleMenu
          editor={editor}
          options={{ placement: "top" }}
          shouldShow={({ state }) => {
            const { from, to } = state.selection;
            // Only show when there's an actual text selection
            return from !== to;
          }}
        >
          <div className="flex items-center gap-0.5 rounded-lg border border-border bg-popover p-1 shadow-md">
            <BubbleToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive("bold")}
              label="Bold"
            >
              <RiBold className="size-3.5" />
            </BubbleToolbarButton>
            <BubbleToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive("italic")}
              label="Italic"
            >
              <RiItalic className="size-3.5" />
            </BubbleToolbarButton>

            <div className="mx-0.5 h-4 w-px bg-border" />

            <BubbleToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 1 }).run()
              }
              isActive={editor.isActive("heading", { level: 1 })}
              label="Heading 1"
            >
              <RiH1 className="size-3.5" />
            </BubbleToolbarButton>
            <BubbleToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 2 }).run()
              }
              isActive={editor.isActive("heading", { level: 2 })}
              label="Heading 2"
            >
              <RiH2 className="size-3.5" />
            </BubbleToolbarButton>
            <BubbleToolbarButton
              onClick={() =>
                editor.chain().focus().toggleHeading({ level: 3 }).run()
              }
              isActive={editor.isActive("heading", { level: 3 })}
              label="Heading 3"
            >
              <RiH3 className="size-3.5" />
            </BubbleToolbarButton>

            <div className="mx-0.5 h-4 w-px bg-border" />

            <BubbleToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive("bulletList")}
              label="Bullet List"
            >
              <RiListUnordered className="size-3.5" />
            </BubbleToolbarButton>
            <BubbleToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive("orderedList")}
              label="Numbered List"
            >
              <RiListOrdered2 className="size-3.5" />
            </BubbleToolbarButton>

            <div className="mx-0.5 h-4 w-px bg-border" />

            <BubbleToolbarButton
              onClick={() => {
                // Create the toggle and immediately set it to open
                editor.chain().focus().setDetails().run();
                
                // Find the just-created details node and toggle it open
                setTimeout(() => {
                  const { state } = editor;
                  const { $from } = state.selection;
                  // Look for details node at or near cursor
                  for (let d = $from.depth; d >= 0; d--) {
                    const node = $from.node(d);
                    if (node.type.name === 'details') {
                      const pos = $from.before(d);
                      // Set open attribute to true
                      editor.chain()
                        .setNodeSelection(pos)
                        .updateAttributes('details', { open: true })
                        .setTextSelection(pos + 2) // Move cursor to summary
                        .run();
                      break;
                    }
                  }
                }, 0);
              }}
              isActive={editor.isActive("details")}
              label="Toggle"
            >
              <RiArrowDownSLine className="size-3.5" />
            </BubbleToolbarButton>
          </div>
        </BubbleMenu>
      )}

      {/* Editor content area */}
      <EditorContent
        editor={editor}
        className={cn(
          // Base text styling matching original textarea
          "goal-notes-prose",
          "w-full text-sm text-muted-foreground leading-relaxed",
          "[&_.tiptap]:outline-none",
          // Placeholder styling
          "[&_.tiptap_p.is-editor-empty:first-child::before]:text-muted-foreground/40",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)]",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:float-left",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:h-0",
          "[&_.tiptap_p.is-editor-empty:first-child::before]:pointer-events-none",
          // Heading styles
          "[&_.tiptap_h1]:text-lg [&_.tiptap_h1]:font-bold [&_.tiptap_h1]:text-foreground [&_.tiptap_h1]:mt-5 [&_.tiptap_h1]:mb-2",
          "[&_.tiptap_h2]:text-base [&_.tiptap_h2]:font-semibold [&_.tiptap_h2]:text-foreground [&_.tiptap_h2]:mt-4 [&_.tiptap_h2]:mb-1",
          "[&_.tiptap_h3]:text-sm [&_.tiptap_h3]:font-medium [&_.tiptap_h3]:text-foreground [&_.tiptap_h3]:mt-3 [&_.tiptap_h3]:mb-1",
          // List styles
          "[&_.tiptap_ul]:list-disc [&_.tiptap_ul]:pl-5 [&_.tiptap_ul]:my-1",
          "[&_.tiptap_ol]:list-decimal [&_.tiptap_ol]:pl-5 [&_.tiptap_ol]:my-1",
          "[&_.tiptap_li]:mb-0.5",
          "[&_.tiptap_li_p]:my-0",
          // Details/toggle styles — defined in globals.css (.goal-notes-prose scoped)
          // Bold and italic
          "[&_.tiptap_strong]:font-semibold [&_.tiptap_strong]:text-foreground",
          "[&_.tiptap_em]:italic",
          // Read-only state
          !onChange && "[&_.tiptap]:cursor-default",
        )}
      />

      {/* Slash command menu */}
      {editor && <SlashCommandMenu editor={editor} />}
    </div>
  );
}
