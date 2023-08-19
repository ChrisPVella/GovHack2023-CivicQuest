// This file isn't processed by Vite, see https://github.com/brillout/vite-plugin-ssr/issues/562
// Consequently:
//  - When changing this file, you needed to manually restart your server for your changes to take effect.
//  - To use your environment variables defined in your .env files, you need to install dotenv, see https://vite-plugin-ssr.com/env
//  - To use your path aliases defined in your vite.config.js, you need to tell Node.js about them, see https://vite-plugin-ssr.com/path-aliases

import express from 'express'
import compression from 'compression'
import { root } from './root.js'
import router from './routes.js'
import pkg from 'body-parser'
const { raw } = pkg;

import { createServerAdapter } from '@whatwg-node/server';
import { error, json } from 'itty-router'
import { setOpenAiKey } from './chat.js'

const isProduction = process.env.NODE_ENV === 'production'

setOpenAiKey(process.env.OPENAI_KEY!);

process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
  // application specific logging, throwing an error, or other logic here
});

startServer()

async function startServer() {
  const app = express()

  app.use(compression())

  // Vite integration
  if (isProduction) {
    // In production, we need to serve our static assets ourselves.
    // (In dev, Vite's middleware serves our static assets.)
    const sirv = (await import('sirv')).default
    app.use(sirv(`${root}/dist/client`))
  } else {
    // We instantiate Vite's development server and integrate its middleware to our server.
    // ⚠️ We instantiate it only in development. (It isn't needed in production and it
    // would unnecessarily bloat our production server.)
    const vite = await import('vite')
    const viteDevMiddleware = (
      await vite.createServer({
        root,
        server: { middlewareMode: true }
      })
    ).middlewares
    app.use(viteDevMiddleware)
  }

  app.use("/", createServerAdapter(request => router.handle(request).then(json).catch(error)));

  const port = process.env.PORT || 3000
  app.listen(port)
  console.log(`Server running at http://localhost:${port}`)
}
