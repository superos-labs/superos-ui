# BubbleMenu extension

This extension will make a contextual menu appear near a selection of text. Use it to let users apply [marks](/docs/editor/extensions/marks) to their text selection.

As always, the markup and styling is totally up to you.

## [](#install)Install

```
npm install @tiptap/extension-bubble-menu
```

## [](#settings)Settings

### [](#element)element

The DOM element that contains your menu.

Type: `HTMLElement`

Default: `null`

In the React version of the `Bubble Menu`, access the DOM element with the `ref` prop of the `BubbleMenu` component, by [passing a ref](https://react.dev/learn/manipulating-the-dom-with-refs) into it.

### [](#updatedelay)updateDelay

The `BubbleMenu` debounces the `update` method to allow the bubble menu to not be updated on every selection update. This can be controlled in milliseconds. The `BubbleMenuPlugin` will come with a default delay of 250ms. This can be deactivated, by setting the delay to `0` which deactivates the debounce.

Type: `Number`

Default: `undefined`

### [](#resizedelay)resizeDelay

The `BubbleMenu` debounces the resize calculation for the bubble menu to allow the bubble menu to not be updated on every resize event. This can be controlled in milliseconds.

Type: `Number`

Default: `100`

### [](#options)options

Under the hood, the `BubbleMenu` [Floating UI](https://floating-ui.com). You can control the middleware and positioning of the floating menu with these options.

Type: `Object`

Default: `{ strategy: 'absolute', placement: 'right' }`

Option

Type

Description

`strategy`

`string`

The positioning strategy. See [here](https://floating-ui.com/docs/computePosition#strategy)

`placement`

`string`

The placement of the menu. See [here](https://floating-ui.com/docs/computePosition#placement)

`offset`

`number`, `OffsetOptions` or `boolean`

The [offset middleware options](https://floating-ui.com/docs/offset#options). If `true` use default options, if `false` disable the middleware

`flip`

`FlipOptions` or `boolean`

The [flip middleware options](https://floating-ui.com/docs/flip#options). If `true` use default options, if `false` disable the middleware

`shift`

`ShiftOptions` or `boolean`

The [shift middleware options](https://floating-ui.com/docs/shift#options). If `true` use default options, if `false` disable the middleware

`arrow`

`ArrowOptions` or `false`

The [arrow middleware options](https://floating-ui.com/docs/arrow#options). If `false` disable the middleware

`size`

`SizeOptions` or `boolean`

The [size middleware options](https://floating-ui.com/docs/size#options). If `true` use default options, if `false` disable the middleware

`autoPlacement`

`AutoPlacementOptions` or `boolean`

The [autoPlacement middleware options](https://floating-ui.com/docs/autoPlacement#options). If `true` use default options, if `false` disable the middleware

`hide`

`HideOptions` or `boolean`

The [hide middleware options](https://floating-ui.com/docs/hide#options). If `true` use default options, if `false` disable the middleware

`inline`

`InlineOptions` or `boolean`

The [inline middleware options](https://floating-ui.com/docs/inline#options). If `true` use default options, if `false` disable the middleware

`onShow`

`Function` or `undefined`

A callback that is called when the menu is shown. This can be used to add custom logic or styles when the menu is displayed.

`onHide`

`Function` or `undefined`

A callback that is called when the menu is hidden. This can be used to add custom logic or styles when the menu is hidden.

`onUpdate`

`Function` or `undefined`

A callback that is called when the menu is updated. This can be used to add custom logic or styles when the menu is updated.

`onDestroy`

`Function` or `undefined`

A callback that is called when the menu is destroyed. This can be used to add custom logic or styles when the menu is removed.

### [](#pluginkey)pluginKey

The key for the underlying ProseMirror plugin. Make sure to use different keys if you add more than one instance.

Type: `string | PluginKey`

Default: `'bubbleMenu'`

### [](#shouldshow)shouldShow

A callback to control whether the menu should be shown or not.

Type: `(props) => boolean`

### [](#appendto)appendTo

The element to which the bubble menu should be appended to in the DOM. Can be a `HTMLElement` or a callback function that returns a `HTMLElement`.

Type: `HTMLElement | (() => HTMLElement) | undefined`

Default: `undefined`, the menu will be appended to the editor's parent element (`editor.view.dom.parentElement`).

### [](#getreferencedvirtualelement)getReferencedVirtualElement

A callback to provide the anchor coordinates used to position the menu. Should return a [virtual element](https://floating-ui.com/docs/virtual-elements) as expected by [Floating UI](https://floating-ui.com/).

Type: `() => VirtualElement | null`

Default: `null`, anchor is implied by the editor selection.

## [](#source-code)Source code

[packages/extension-bubble-menu/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-bubble-menu/)

## [](#use-the-extension)Use the extension

### [](#javascript)JavaScript

```
import { Editor } from '@tiptap/core'
import BubbleMenu from '@tiptap/extension-bubble-menu'

new Editor({
  extensions: [
    BubbleMenu.configure({
      element: document.querySelector('.menu'),
    }),
  ],
})
```

### [](#other-frameworks)Other frameworks

Check out the demo at the [top of this page](#) to see how to integrate the bubble menu extension with React or Vue.

### [](#custom-logic)Custom logic

Customize the logic for showing the menu with the `shouldShow` option. For components, `shouldShow` can be passed as a prop.

```
BubbleMenu.configure({
  shouldShow: ({ editor, view, state, oldState, from, to }) => {
    // only show the bubble menu for images and links
    return editor.isActive('image') || editor.isActive('link')
  },
})
```

### [](#multiple-menus)Multiple menus

Use multiple menus by setting an unique `pluginKey`.

```
import { Editor } from '@tiptap/core'
import BubbleMenu from '@tiptap/extension-bubble-menu'

new Editor({
  extensions: [
    BubbleMenu.configure({
      pluginKey: 'bubbleMenuOne',
      element: document.querySelector('.menu-one'),
    }),
    BubbleMenu.configure({
      pluginKey: 'bubbleMenuTwo',
      element: document.querySelector('.menu-two'),
    }),
  ],
})
```

Alternatively you can pass a ProseMirror `PluginKey`.

```
import { Editor } from '@tiptap/core'
import BubbleMenu from '@tiptap/extension-bubble-menu'
import { PluginKey } from '@tiptap/pm/state'

new Editor({
  extensions: [
    BubbleMenu.configure({
      pluginKey: new PluginKey('bubbleMenuOne'),
      element: document.querySelector('.menu-one'),
    }),
    BubbleMenu.configure({
      pluginKey: new PluginKey('bubbleMenuTwo'),
      element: document.querySelector('.menu-two'),
    }),
  ],
})
```

### [](#force-update-the-position-of-the-bubble-menu)Force update the position of the bubble menu

If the bubble menu changes size after the initial render, its position will not be adjusted automatically. To fix this, you can force update the position of the bubble menu by emitting an `'updatePosition'` event.

```
editor.commands.setMeta('bubbleMenu', 'updatePosition')
```
