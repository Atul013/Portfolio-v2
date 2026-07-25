import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'

/**
 * Loads .env into process.env for the dev server only.
 *
 * Vite's own loadEnv deliberately only exposes VITE_-prefixed vars, and only to
 * the client. These are server-side secrets for the api/ handlers, so they are
 * read here and never reach the bundle.
 */
function loadDotEnv(root) {
  const file = path.join(root, '.env')
  if (!fs.existsSync(file)) return
  for (const line of fs.readFileSync(file, 'utf8').split('\n')) {
    const t = line.trim()
    if (!t || t.startsWith('#')) continue
    const eq = t.indexOf('=')
    if (eq === -1) continue
    const key = t.slice(0, eq).trim()
    const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '')
    if (val && process.env[key] === undefined) process.env[key] = val
  }
}

/**
 * Serves the Vercel-style functions in api/ from the Vite dev server.
 *
 * Without this, local dev needs a second `vercel dev` process on another port
 * and a proxy pointing at it, which silently returns connection-refused the
 * moment that process is not running. Running the handlers in-process means
 * `npm run dev` alone gives you a working /api on the same origin.
 *
 * Only the request/response surface the handlers actually use is shimmed:
 * method, query, parsed JSON body, and status/json/send/setHeader.
 */
function apiDevServer() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      loadDotEnv(server.config.root)

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        const url = new URL(req.url, 'http://localhost')
        const name = url.pathname.replace(/^\/api\//, '').replace(/\/+$/, '')
        const file = path.join(server.config.root, 'api', `${name}.js`)

        if (!name || !fs.existsSync(file)) {
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          return res.end(JSON.stringify({ error: `No API route: /api/${name}` }))
        }

        // Collect the body; Vercel hands handlers an already-parsed req.body.
        let raw = ''
        for await (const chunk of req) raw += chunk
        let body
        if (raw) {
          try { body = JSON.parse(raw) } catch { body = raw }
        }

        req.query = Object.fromEntries(url.searchParams)
        req.body = body

        res.status = (code) => { res.statusCode = code; return res }
        res.json = (obj) => {
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(obj))
          return res
        }
        res.send = (data) => {
          res.end(typeof data === 'string' ? data : JSON.stringify(data))
          return res
        }

        try {
          // ssrLoadModule so edits to api/*.js are picked up without a restart.
          const mod = await server.ssrLoadModule(file)
          await (mod.default ?? mod.handler)(req, res)
        } catch (err) {
          server.config.logger.error(`[api] /api/${name} threw: ${err.stack || err}`)
          if (!res.writableEnded) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Handler threw', detail: String(err.message || err) }))
          }
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), apiDevServer()],
  server: {
    port: 3000,
    strictPort: true,
  },
})
