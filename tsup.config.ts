import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/server.ts', 'src/outbox-worker.ts', 'src/replay-processing.ts'],
  outDir: 'build',
  format: ['cjs'],
  clean: true,
})
