import { defineConfig } from 'tsup'

export default defineConfig({
  entry: {
    server: 'src/server.ts',
    'outbox-worker': 'src/entrypoints/outbox-worker.ts',
  },
  outDir: 'build',
  format: ['cjs'],
  clean: true,
})
