import { builtinModules } from 'node:module';
import { defineConfig } from 'tsup';

/** Конфигурация сборки tsup для CLI-инструмента cursor-rules */
export default defineConfig({
    bundle: true,
    clean: true,
    dts: false,
    entry: ['src/cli.ts'],
    esbuildOptions(options) {
        return {
            ...options,
            banner: {
                js: '#!/usr/bin/env node',
            },
        };
    },
    external: [...builtinModules, ...builtinModules.map((m) => `node:${m}`)],
    format: ['cjs'],
    noExternal: ['citty', 'gray-matter', 'micromatch', 'picocolors', 'zod'],
    outDir: 'dist',
    platform: 'node',
    sourcemap: false,
    target: 'node20',
});
