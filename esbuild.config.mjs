// Modified: 2026-08-18
import * as esbuild from 'esbuild';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const production = process.argv[2] === 'production';
const root = path.dirname(fileURLToPath(import.meta.url));
const bundledContentDirectory = path.join(root, 'bundled-content');

async function filesBelow(directory) {
    const files = [];
    for (const entry of await readdir(directory, { withFileTypes: true })) {
        const absolute = path.join(directory, entry.name);
        if (entry.isDirectory()) files.push(...await filesBelow(absolute));
        else if (entry.isFile()) files.push(absolute);
    }
    return files.sort();
}

const bundledEducationalContentPlugin = {
    name: 'bundled-educational-content',
    setup(build) {
        build.onResolve({ filter: /^bundled-educational-content$/ }, () => ({
            path: 'bundled-educational-content',
            namespace: 'bundled-educational-content'
        }));
        build.onLoad({ filter: /.*/, namespace: 'bundled-educational-content' }, async () => {
            const files = (await filesBelow(bundledContentDirectory))
                .filter((file) => path.basename(file) !== 'content-manifest.json');
            const entries = await Promise.all(files.map(async (file) => [
                path.relative(bundledContentDirectory, file).split(path.sep).join('/'),
                await readFile(file, 'utf8')
            ]));
            return {
                contents: `export default ${JSON.stringify(Object.fromEntries(entries))};`,
                loader: 'js',
                watchFiles: files
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
    plugins: [bundledEducationalContentPlugin, workerSourcePlugin],
    logLevel: 'info'
};

if (production) {
    await esbuild.build(options);
} else {
    const context = await esbuild.context(options);
    await context.watch();
}
