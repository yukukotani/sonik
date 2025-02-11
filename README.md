# Sonik

Sonik is a simple and fast -_supersonic_- meta framework for creating web APIs and websites with Server-Side Rendering.
It stands on the shoulders of giants; built on [Hono](https://hono.dev), [Vite](https://vitejs.dev), and JSX-based UI libraries.

**Note:** _Sonik is currently in a "alpha stage". There will be breaking changes without any announcement. Don't use it in production. However, feel free to try it in your hobby project and give us your feedback!_

## Features

- **File-based routing** - Now, you can create a large app by separating concerns.
- **Fast SSR** - Supports only Server-Side Rendering. Rendering is ultra-fast thanks to Hono.
- **No JavaScript** - By default, there's no need for JavaScript. Nothing loads.
- **Island hydration** - If you want interaction, create an island. JavaScript is hydrated only for that island.
- **UI presets** - Any JSX-based UI library works with Sonik. Presets for hono/jsx, Preact, React are available.
- **Easy API creation** - You can create APIs using Hono's syntax.
- **Middleware** - It works just like Hono, so you can use many of Hono's middleware.
- **Edge optimized** - The bundle size is minimized, making it easy to deploy to edge platforms like Cloudflare Workers.

## Quick Start

### Getting with the starter templates

Give it a try:

```txt
npm create sonik@latest

// Or

yarn create sonik

// Or

pnpm create sonik@latest
```

### Usage

_By default, it can be deployed to Cloudflare Pages._

npm:

```txt
npm install
npm run dev
npm run build
npm run deploy
```

yarn:

```txt
yarn install
yarn dev
yarn build
yarn deploy
```

## Project Structure

Below is a typical project structure for a Sonik application with Islands.

```txt
.
├── app
│   ├── client.ts // client entry file
│   ├── islands
│   │   └── counter.tsx // island component
│   ├── routes
│   │   ├── _404.tsx // not found page
│   │   ├── _error.tsx // error page
│   │   ├── _layout.tsx // layout template
│   │   ├── about
│   │   │   └── [name].tsx // matches `/about/:name`
│   │   └── index.tsx // matches `/`
│   ├── server.ts // server entry file
│   └── style.css
├── package.json
├── public
│   └── favicon.ico
├── tsconfig.json
└── vite.config.ts
```

## Building Your Application

### Server Entry File

A server entry file is required. The file is should be placed at `src/server.ts`.
This file is first called by the Vite during the development or build phase.

In the entry file, simply initialize your app using the `createApp()` function. `app` will be an instance of Hono, so you can utilize Hono's middleware and the `app.showRoutes()` feature.

```ts
// app/server.ts
import { createApp } from 'sonik'

const app = createApp()

app.showRoutes()

export default app
```

### Presets

You can construct pages with the JSX syntax using your favorite UI framework. Presets for hono/jsx, Preact, React are available.

If you prefer to use the Preact presets, simply import from `@sonikjs/preact`:

```ts
import { createApp } from '@sonikjs/preact'
```

The following presets are available:

- `sonik` - hono/jsx
- `@sonikjs/preact` - Preact
- `@sonikjs/react` - React

### Pages

There are two syntaxes for creating a page.

#### `c.render()`

Before introducing the two syntaxes, let you know about `c.render()`.

You can use `c.render()` to return a HTML content with applying the layout is applied.
The `Renderer` definition is the following:

```ts
declare module 'hono' {
  interface ContextRenderer {
    (content: Node, head?: Partial<Pick<types.Head, 'title' | 'link' | 'meta'>>):
      | Response
      | Promise<Response>
  }
}
```

#### `AppRoute` Component

Export the `AppRoute` typed object with `defineRoute()` as the `route`.
The `app` is an instance of `Hono`.

```ts
// app/index.tsx
import { defineRoute } from 'sonik'

export const route = defineRoute((app) => {
  app.get((c) => {
    const res = c.render(<h1>Hello</h1>, {
      title: 'This is a title',
      meta: [{ name: 'description', content: 'This is a description' }],
    })
    return res
  })
})
```

#### Function component

Just return JSX function as the `default`:

```ts
// app/index.tsx
export default function Home() {
  return <h1>Hello!</h1>
}
```

Or you can use the `Context` instance:

```ts
import type { Context } from 'sonik'

// app/index.tsx
export default function Home(c: Context) {
  return c.render(<h1>Hello!</h1>, {
    title: 'My title',
  })
}
```

#### Use both syntaxes

You can put both syntaxes in one file:

```ts
export const route = defineRoute((app) => {
  app.post((c) => {
    return c.text('Created!', 201)
  })
})

export default function Books(c: Context) {
  return c.render(
    <form method='POST'>
      <input type='text' name='title' />
      <input type='submit' />
    </form>
  )
}
```

### Creating API

You can write the API endpoints in the same syntax as Hono.

```ts
// app/routes/about/index.ts
import { Hono } from 'hono'

const app = new Hono()

// matches `/about/:name`
app.get('/:name', (c) => {
  const name = c.req.param('name')
  return c.json({
    'your name is': name,
  })
})

export default app
```

### Reserved Files

Files named in the following manner have designated roles:

- `_404.tsx` - Not found page
- `_error.tsx` - Error page
- `_layout.tsx` - Layout template
- `__layout.tsx` - Template for nested layouts

### Client

To write client-side scripts that include JavaScript or stylesheets managed by Vite, craft a file and import `sonik/client` as seen in `app/client.ts`:

```ts
import { createClient } from '@sonikjs/preact/client'

createClient()
```

Also presets are avialbles for client entry file:

- `@sonikjs/preact/client` - Preact
- `@sonikjs/react/client` - React

And then, import it in `app/routes/_layout.tsx`:

```tsx
import type { LayoutHandler } from '@sonikjs/preact'

const handler: LayoutHandler = ({ children, head }) => {
  return (
    <html lang='en'>
      <head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        {import.meta.env.PROD ? (
          <>
            <link href='/static/style.css' rel='stylesheet' />
            <script type='module' src='/static/client.js'></script>
          </>
        ) : (
          <>
            <link href='/app/style.css' rel='stylesheet' />
            <script type='module' src='/app/client.ts'></script>
          </>
        )}
        {head.createTags()}
      </head>
      <body>
        <div class='bg-gray-200 h-screen'>{children}</div>
      </body>
    </html>
  )
}

export default handler
```

`import.meta.env.PROD` is useful flag for separate tags wehere it is on dev server or production.
You should use `/app/client.ts` in development and use the file built in the production.

### Using Middleware

Given that a Sonik instance is fundamentally a Hono instance, you can utilize all of Hono's middleware. If you wish to apply it before the Sonik app processes a request, create a `base` variable and pass it as a constructor option for `createApp()`:

```ts
const base = new Hono()
base.use('*', poweredBy())

const app = createApp({
  app: base,
})
```

### Using Tailwind CSS

Given that Sonik is Vite-centric, if you wish to utilize Tailwind CSS, simply adhere to the official instructions.

Prepare `tailwind.config.js` and `postcss.config.js`:

```js
// tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./app/**/*.tsx'],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

Write `app/style.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Finally, import it in client entry file:

```ts
//app/client.ts
import { createClient } from '@sonikjs/preact/client'
import './style.css'

createClient()
```

### Using MDX

Integrate MDX using `@mdx-js/rollup` by configuring it in `vite.config.ts`:

```ts
import devServer from '@hono/vite-dev-server'
import mdx from '@mdx-js/rollup'
import { defineConfig } from 'vite'
import sonik from 'sonik/vite'

export default defineConfig({
  plugins: [
    devServer({
      entry: './app/server.ts',
    }),
    sonik(),
    {
      ...mdx({
        jsxImportSource: 'preact',
      }),
    },
  ],
})
```

### SSR Streaming

Sonik supports SSR Streaming, which, as of now, is exclusively available for React with `Suspense`.

To enable is, set the `streaming` as `true` and pass the `renderToReadableString()` method in the `createApp()`:

```ts
import { renderToReadableStream } from 'react-dom/server'

const app = createApp({
  streaming: true,
  renderToReadableStream: renderToReadableStream,
})
```

## Deployment

Since a Sonik instance is essentially a Hono instance, it can be deployed on any platform that Hono supports.

The following adapters for deploying to the platforms are available in the Sonik package.

### Cloudflare Pages

Setup the `vite.config.ts`:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import sonik from 'sonik/vite'
import pages from 'sonik/cloudflare-pages'

export default defineConfig({
  plugins: [sonik(), pages()],
})
```

Build command (including a client):

```txt
vite build && vite build --mode client
```

Deploy with the following commands after build. Ensure you have [Wrangler](https://developers.cloudflare.com/workers/wrangler/) installed:

```txt
wrangler pages deploy ./dist
```

### Vercel

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import sonik from 'sonik/vite'
import vercel from 'sonik/vercel'

export default defineConfig({
  plugins: [sonik(), vercel()],
})
```

Build command (including a client):

```txt
vite build && vite build --mode client
```

Ensure you have [Vercel CLI](https://vercel.com/docs/cli) installed.

```txt
vercel --prebuilt
```

### Cloudflare Workers

_The Cloudflare Workers adapter supports the "server" only and does not support the "client"._

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import sonik from 'sonik/vite'
import workers from 'sonik/cloudflare-workers'

export default defineConfig({
  plugins: [sonik(), workers()],
})
```

Build command:

```txt
vite build
```

Deploy command:

```txt
wrangler deploy --compatibility-date 2023-08-01 --minify ./dist/index.js --name my-app
```

## Examples

- [Sonik Blog](https://github.com/yusukebe/sonik-blog)
- [ChatGPT Streaming](https://github.com/yusukebe/chatgpt-streaming)

## Related projects

- [Hono](https://hono.dev)
- [Vite](https://vitejs.dev/)

## Authors

- Yusuke Wada <https://github.com/yusukebe>

## License

MIT
