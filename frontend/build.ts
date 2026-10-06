// Production build: bundles src/index.html (+ JS, CSS, fonts, images) into dist/.
import tailwind from 'bun-plugin-tailwind'
import { rm } from 'node:fs/promises'

const outdir = process.argv[2] ?? 'dist'
await rm(outdir, { recursive: true, force: true })

const result = await Bun.build({
  entrypoints: ['src/index.html'],
  outdir,
  plugins: [tailwind],
  minify: true,
  target: 'browser',
  sourcemap: 'linked',
  define: { 'process.env.NODE_ENV': '"production"' },
})

if (!result.success) {
  for (const log of result.logs) console.error(log)
  process.exit(1)
}

for (const out of result.outputs) {
  console.log(`${out.path.replace(`${process.cwd()}/`, '')}  ${(out.size / 1024).toFixed(1)} KB`)
}
