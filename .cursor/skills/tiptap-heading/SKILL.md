# Heading extension

The Heading extension adds support for headings of different levels. Headings are rendered with `<h1>`, `<h2>`, `<h3>`, `<h4>`, `<h5>` or `<h6>` HTML tags. By default all six heading levels (or styles) are enabled, but you can pass an array to only allow a few levels. Check the usage example to see how this is done.

Type `#` at the beginning of a new line and it will magically transform to a heading, same for `##` , `###` , `####` , `#####` and `######` .

## [](#install)Install

```
npm install @tiptap/extension-heading
```

## [](#settings)Settings

### [](#htmlattributes)HTMLAttributes

Custom HTML attributes that should be added to the rendered HTML tag.

```
Heading.configure({
  HTMLAttributes: {
    class: 'my-custom-class',
  },
})
```

### [](#levels)levels

Specifies which heading levels are supported.

Default: `[1, 2, 3, 4, 5, 6]`

```
Heading.configure({
  levels: [1, 2],
})
```

## [](#commands)Commands

### [](#setheading)setHeading()

Creates a heading node with the specified level.

```
editor.commands.setHeading({ level: 1 })
```

### [](#toggleheading)toggleHeading()

Toggles a heading node with the specified level.

```
editor.commands.toggleHeading({ level: 1 })
```

## [](#keyboard-shortcuts)Keyboard shortcuts

Command

Windows/Linux

macOS

toggleHeading( level: 1 )

Control + Alt + 1

Cmd + Alt + 1

toggleHeading( level: 2 )

Control + Alt + 2

Cmd + Alt + 2

toggleHeading( level: 3 )

Control + Alt + 3

Cmd + Alt + 3

toggleHeading( level: 4 )

Control + Alt + 4

Cmd + Alt + 4

toggleHeading( level: 5 )

Control + Alt + 5

Cmd + Alt + 5

toggleHeading( level: 6 )

Control + Alt + 6

Cmd + Alt + 6

## [](#source-code)Source code

[packages/extension-heading/](https://github.com/ueberdosis/tiptap/blob/main/packages/extension-heading/)
