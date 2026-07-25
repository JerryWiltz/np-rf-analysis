// Modified: 2026-07-25
import * as esbuild from 'esbuild';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const production = process.argv[2] === 'production';
const root = path.dirname(fileURLToPath(import.meta.url));
const learningGuideImageDirectory = path.join(root, 'learning-guide/Images');

const learningGuideAssetsPlugin = {
    name: 'learning-guide-assets',
    setup(build) {
        build.onResolve({ filter: /^learning-guide-assets$/ }, () => ({
            path: 'learning-guide-assets',
            namespace: 'learning-guide'
        }));
        build.onLoad({ filter: /.*/, namespace: 'learning-guide' }, async () => {
            const filenames = (await readdir(learningGuideImageDirectory))
                .filter((filename) => filename.endsWith('.svg'))
                .sort();
            const entries = await Promise.all(filenames.map(async (filename) => [
                filename,
                await readFile(path.join(learningGuideImageDirectory, filename), 'utf8')
            ]));
            return {
                contents: `export default ${JSON.stringify(Object.fromEntries(entries))};`,
                loader: 'js',
                watchFiles: filenames.map((filename) =>
                    path.join(learningGuideImageDirectory, filename))
            };
        });
    }
};

const workerSourcePlugin = {
    name: 'npjs-worker-source',
    setup(build) {
        build.onResolve({ filter: /^npjs-worker-source$/ }, () => ({
            path: 'npjs-worker-source',
            namespace: 'npjs-worker'
        }));
        build.onLoad({ filter: /.*/, namespace: 'npjs-worker' }, async () => {
            const result = await esbuild.build({
                entryPoints: [path.join(root, 'src/npjs-worker.ts')],
                bundle: true,
                format: 'iife',
                target: 'es2018',
                platform: 'browser',
                minify: production,
                sourcemap: false,
                write: false,
                logLevel: 'silent'
            });
            const output = result.outputFiles?.[0];
            if (!output) throw new Error('The npjs worker bundle was not generated.');
            return {
                contents: `export default ${JSON.stringify(output.text)};`,
                loader: 'js',
                watchFiles: [
                    path.join(root, 'src/npjs-worker.ts'),
                    path.join(root, 'src/npjs-protocol.ts'),
                    path.join(root, 'vendor/nP.esm.js')
                ]
            };
        });
    }
};

const options = {
    entryPoints: ['src/main.ts'],
    bundle: true,
    external: [
        'obsidian',
        'electron',
        '@codemirror/state',
        '@codemirror/view'
    ],
    format: 'cjs',
    target: 'es2018',
    platform: 'browser',
    outfile: 'main.js',
    loader: {
        '.md': 'text'
    },
    minify: production,
    sourcemap: production ? false : 'inline',
    treeShaking: true,
    plugins: [learningGuideAssetsPlugin, workerSourcePlugin],
    logLevel: 'info'
};

if (production) {
    await esbuild.build(options);
} else {
    const context = await esbuild.context(options);
    await context.watch();
}
