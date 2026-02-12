# Paragraph extension

Yes, the schema is very strict. Without this extension you won’t even be able to use paragraphs in the editor.

### Breaking Change

Tiptap v1 tried to hide that node from you, but it has always been there. You have to explicitly import it from now on (or use [StarterKit](/docs/editor/extensions/functionality/starterkit)).

## [](#install)Install

```
npm install @tiptap/extension-paragraph
```

## [](#settings)Settings

### [](#htmlattributes)HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

```
Paragraph.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

## [](#commands)Commands

### [](#setparagraph)setParagraph()

Transforms all selected nodes to paragraphs.

```
editor.commands.setParagraph()
```

## [](#keyboard-shortcuts)Keyboard shortcuts

Command

Windows/Linux

macOS

setParagraph()

Control + Alt + 0

Cmd + Alt + 0

## [](#source-code)Source code

[packages/extension-paragraph/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-paragraph/)
