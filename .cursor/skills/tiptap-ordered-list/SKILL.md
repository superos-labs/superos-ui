# OrderedList extension

This extension enables you to use ordered lists in the editor. They are rendered as `<ol>` HTML tags.

Type `1.` (or any other number followed by a dot) at the beginning of a new line and it will magically transform to a ordered list.

### Modify backspace behavior

If you want to modify the standard behavior of backspace and delete functions for lists, you should read about the [ListKeymap](/docs/editor/extensions/functionality/listkeymap) extension.

## [](#install)Install

```
npm install @tiptap/extension-list
```

This extension requires the [`ListItem`](/docs/editor/extensions/nodes/list-item) node.

## [](#usage)Usage

```
import { Editor } from '@tiptap/core'
import { OrderedList } from '@tiptap/extension-list'

new Editor({
  extensions: [OrderedList],
})
```

This extension is installed by default with the `ListKit` extension, so you don’t need to install it separately.

```
import { Editor } from '@tiptap/core'
import { ListKit } from '@tiptap/extension-list'

new Editor({
  extensions: [ListKit],
})
```

## [](#settings)Settings

### [](#htmlattributes)HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

```
OrderedList.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

### [](#itemtypename)itemTypeName

Specify the list item name.

Default: `'listItem'`

```
OrderedList.configure({
  itemTypeName: 'listItem',
})
```

### [](#keepmarks)keepMarks

Decides whether to keep the marks from a previous line after toggling the list either using `inputRule` or using the button

Default: `false`

```
OrderedList.configure({
  keepMarks: true,
})
```

### [](#keepattributes)keepAttributes

Decides whether to keep the attributes from a previous line after toggling the list either using `inputRule` or using the button

Default: `false`

```
OrderedList.configure({
  keepAttributes: true,
})
```

## [](#commands)Commands

### [](#toggleorderedlist)toggleOrderedList()

Toggle an ordered list.

```
editor.commands.toggleOrderedList()
```

## [](#keyboard-shortcuts)Keyboard shortcuts

Command

Windows/Linux

macOS

toggleOrderedList

Control + Shift + 7

Cmd + Shift + 7

## [](#source-code)Source code

[packages/extension-list/src/ordered-list/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-list/src/ordered-list/)

## [](#minimal-install)Minimal Install

```
import { Editor } from '@tiptap/core'
import { OrderedList } from '@tiptap/extension-list/ordered-list'

new Editor({
  extensions: [OrderedList],
})
```
