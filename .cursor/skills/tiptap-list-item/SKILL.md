# ListItem extension

The ListItem extension adds support for the `<li>` HTML tag. It’s used for bullet lists and ordered lists and can’t really be used without them.

### Modify backspace behavior

If you want to modify the standard behavior of backspace and delete functions for lists, you should read about the [ListKeymap](/docs/editor/extensions/functionality/listkeymap) extension.

## [](#install)Install

```
npm install @tiptap/extension-list
```

This extension requires the [`BulletList`](/docs/editor/extensions/nodes/bullet-list) or [`OrderedList`](/docs/editor/extensions/nodes/ordered-list) node.

## [](#usage)Usage

```
import { Editor } from '@tiptap/core'
import { ListItem } from '@tiptap/extension-list'

new Editor({
  extensions: [ListItem],
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
ListItem.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

## [](#keyboard-shortcuts)Keyboard shortcuts

Command

Windows/Linux

macOS

splitListItem()

Enter

Enter

sinkListItem()

Tab

Tab

liftListItem()

Shift + Tab

Shift + Tab

## [](#source-code)Source code

[packages/extension-list/src/item/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-list/src/item/)

## [](#minimal-install)Minimal Install

```
import { Editor } from '@tiptap/core'
import { ListItem } from '@tiptap/extension-list/item'

new Editor({
  extensions: [ListItem],
})
```
