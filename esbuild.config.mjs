// Modified: 2026-07-15
import * as esbuild from 'esbuild';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const production = process.argv[2] === 'production';
const root = path.dirname(fileURLToPath(import.meta.url));

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
    minify: production,
    sourcemap: production ? false : 'inline',
    treeShaking: true,
    plugins: [workerSourcePlugin],
    logLevel: 'info'
};

if (production) {
    await esbuild.build(options);
} else {
    const context = await esbuild.context(options);
    await context.watch();
}
