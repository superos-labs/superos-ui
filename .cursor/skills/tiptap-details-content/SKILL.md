# DetailsContent extension

The Details extension enables you to use the `<details>` HTML tag in the editor. This is great to show and hide content.

## [](#install)Install

```
npm install @tiptap/extension-details
```

## [](#usage)Usage

```
import { Details, DetailsSummary, DetailsContent } from '@tiptap/extension-details'

const editor = new Editor({
  extensions: [Details, DetailsSummary, DetailsContent],
})
```

## [](#settings)Settings

### [](#htmlattributes)HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

```
DetailsContent.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```
