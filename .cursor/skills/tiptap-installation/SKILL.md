# Next.js

Integrate Tiptap with your Next.js project using this step-by-step guide.

### [](#requirements)Requirements

- [Node](https://nodejs.org/en/download/) installed on your machine
- Experience with [React](https://reactjs.org/)

## [](#create-a-project-optional)Create a project (optional)

If you already have an existing Next.js project, that's fine too. Just skip this step.

For the purpose of this guide, start a new Next.js project called `my-tiptap-project`. The following command sets up everything we need to get started.

```
# create a project
npx create-next-app my-tiptap-project

# change directory
cd my-tiptap-project
```

### [](#install-dependencies)Install dependencies

Now that we have a standard boilerplate set up, we can get Tiptap up and running! For this, we will need to install three packages: `@tiptap/react`, `@tiptap/pm`, and `@tiptap/starter-kit`, which includes all the extensions you need to get started quickly.

```
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit
```

If you followed steps 1 and 2, you can now start your project with `npm run dev` and open [http://localhost:3000/](http://localhost:3000/) in your favorite browser. This might be different if you're working with an existing project.

## [](#integrate-tiptap)Integrate Tiptap

To start using Tiptap, you'll need to add a new component to your app. To do so, first create a directory called `components/`. Now it's time to create our component which we'll call `Tiptap`. To do this, add the following example code in `components/Tiptap.jsx`.

```
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'

const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World! 🌎️</p>',
    // Don't render immediately on the server to avoid SSR issues
    immediatelyRender: false,
  })

  return <EditorContent editor={editor} />
}

export default Tiptap
```

### [](#add-it-to-your-app)Add it to your app

Now, let's replace the content of `app/page.js` (or `pages/index.js`, if you are using the Pages router) with the following example code to use the `Tiptap` component in our app.

```
import Tiptap from '../components/Tiptap'

export default function Home() {
  return <Tiptap />
}
```

You should now see Tiptap in your browser. Time to give yourself a pat on the back! :)
