import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/server.ts', 'src/outbox-worker.ts'],
  outDir: 'build',
  format: ['cjs'],
  clean: true,
})
