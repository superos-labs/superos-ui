# BulletList extension

This extension enables you to use bullet lists in the editor. They are rendered as `<ul>` HTML tags. Type `*` , `-` or `+` at the beginning of a new line and it will magically transform to a bullet list.

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
import { BulletList } from '@tiptap/extension-list'

new Editor({
  extensions: [BulletList],
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
BulletList.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

### [](#itemtypename)itemTypeName

Specify the list item name.

Default: `'listItem'`

```
BulletList.configure({
  itemTypeName: 'listItem',
})
```

### [](#keepmarks)keepMarks

Decides whether to keep the marks from a previous line after toggling the list either using `inputRule` or using the button

Default: `false`

```
BulletList.configure({
  keepMarks: true,
})
```

### [](#keepattributes)keepAttributes

Decides whether to keep the attributes from a previous line after toggling the list either using `inputRule` or using the button

Default: `false`

```
BulletList.configure({
  keepAttributes: true,
})
```

## [](#commands)Commands

### [](#togglebulletlist)toggleBulletList()

Toggles a bullet list.

```
editor.commands.toggleBulletList()
```

## [](#keyboard-shortcuts)Keyboard shortcuts

Command

Windows/Linux

macOS

toggleBulletList

Control + Shift + 8

Cmd + Shift + 8

## [](#source-code)Source code

[packages/extension-list/src/bullet-list/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-list/src/bullet-list/)

## [](#minimal-install)Minimal Install

```
import { Editor } from '@tiptap/core'
import { BulletList } from '@tiptap/extension-list/bullet-list'

new Editor({
  extensions: [BulletList],
})
```
