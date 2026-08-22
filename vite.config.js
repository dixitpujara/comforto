import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { readdir, readFile, writeFile, stat } from 'node:fs/promises'
import { join, relative, posix, sep } from 'node:path'
import { createHash } from 'node:crypto'

// Vercel serves from root; GitHub Pages serves from /comforto/.
// Vercel automatically sets the VERCEL env var during build, so we use
// that to pick the correct base path without breaking either deploy.
const isVercel = !!process.env.VERCEL

// Files the service worker should cache at install rather than lazily on first
// request. Without this the app only works offline for pages already visited —
// precaching is what lets it keep running if the site itself goes down.
const PRECACHE_EXT = /\.(?:js|css|woff2?|ttf|otf|svg|webmanifest)$/i
const SKIP = new Set(['sw.js'])

const walk = async (dir, root = dir, out = []) => {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) await walk(full, root, out)
    else out.push(relative(root, full).split(sep).join(posix.sep))
  }
  return out
}

// Writes the asset list and a content-derived build id into dist/sw.js, so a new
// deploy retires the previous caches instead of serving a stale mix.
const precachePlugin = () => ({
  name: 'comforto-precache',
  apply: 'build',
  async closeBundle() {
    const dist = 'dist'
    const swPath = join(dist, 'sw.js')
    try { await stat(swPath) } catch { return }   // no service worker in this build

    const files = (await walk(dist))
      .filter(f => PRECACHE_EXT.test(f) && !SKIP.has(f))

    const source = await readFile(swPath, 'utf8')

    // Derived from the asset names *and* the worker's own source: editing only
    // sw.js leaves every filename unchanged, and a build id that ignored that
    // would keep serving the previous caches.
    const buildId = createHash('sha1').update(files.join('|')).update(source).digest('hex').slice(0, 8)

    const banner =
      `self.__PRECACHE__ = ${JSON.stringify(files)};\n` +
      `self.__BUILD_ID__ = ${JSON.stringify(buildId)};\n`
    await writeFile(swPath, banner + source, 'utf8')

    this.info?.(`precached ${files.length} files (build ${buildId})`)
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), precachePlugin()],
  base: isVercel ? '/' : '/comforto/',
})
