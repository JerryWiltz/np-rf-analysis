// Modified: 2026-07-13
import * as esbuild from 'esbuild';

const production = process.argv[2] === 'production';

const options = {
    entryPoints: ['src/main.ts'],
    bundle: true,
    external: ['obsidian', 'electron'],
    format: 'cjs',
    target: 'es2018',
    platform: 'browser',
    outfile: 'main.js',
    minify: production,
    sourcemap: production ? false : 'inline',
    treeShaking: true,
    logLevel: 'info'
};

if (production) {
    await esbuild.build(options);
} else {
    const context = await esbuild.context(options);
    await context.watch();
}
