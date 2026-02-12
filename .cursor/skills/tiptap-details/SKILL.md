# Details extension

The Details extension enables you to use the `<details>` HTML tag in the editor. This is great to show and hide content.

## [](#install)Install

```
npm install @tiptap/extension-details
```

This extension requires the [`DetailsSummary`](/docs/editor/extensions/nodes/details-summary) and [`DetailsContent`](/docs/editor/extensions/nodes/details-content) node.

## [](#settings)Settings

### [](#persist)persist

Specify if the open status should be saved in the document. Defaults to `false`.

```
Details.configure({
  persist: true,
})
```

### [](#openclassname)openClassName

Specifies a CSS class that is set when toggling the content. Defaults to `is-open`.

```
Details.configure({
  openClassName: 'is-open',
})
```

### [](#htmlattributes)HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

```
Details.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

## [](#commands)Commands

### [](#setdetails)setDetails()

Wrap content in a details node.

```
editor.commands.setDetails()
```

### [](#unsetdetails)unsetDetails()

Unwrap a details node.

```
editor.commands.unsetDetails()
```
