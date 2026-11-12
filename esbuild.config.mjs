// Modified: 2026-11-12
import {createHash} from 'node:crypto';
import * as esbuild from 'esbuild';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const production = process.argv[2] === 'production';
const root = path.dirname(fileURLToPath(import.meta.url));
const bundledContentDirectory = path.join(root, 'nPort-plugin-content');

const bundledEducationalContentPlugin = {
    name: 'bundled-educational-content',
    setup(build) {
        build.onResolve({ filter: /^bundled-educational-content$/ }, () => ({
            path: 'bundled-educational-content',
            namespace: 'bundled-educational-content'
        }));
        build.onLoad({ filter: /.*/, namespace: 'bundled-educational-content' }, async () => {
            const manifestPath = path.join(bundledContentDirectory, 'content-manifest.json');
            const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
            if (manifest.version !== 2 || !Array.isArray(manifest.files)
                || typeof manifest.pluginVersion !== 'string'
                || manifest.releaseNotesFolder !== `What's new in version ${manifest.pluginVersion}`) {
                throw new Error('Bundled educational-content manifest is invalid.');
            }
            const entries = await Promise.all(manifest.files.map(async (entry) => {
                const isExample = typeof entry.path === 'string'
                    && entry.path.startsWith('Examples/')
                    && !entry.path.slice('Examples/'.length).includes('/');
                const releasePrefix = `${manifest.releaseNotesFolder}/`;
                const isReleaseNote = typeof entry.path === 'string'
                    && entry.path.startsWith(releasePrefix)
                    && !entry.path.slice(releasePrefix.length).includes('/');
                if (!isExample && !isReleaseNote) {
                    throw new Error(`Bundled content is outside the flat Examples and release-note folders: ${entry.path}`);
                }
                const absolute = path.resolve(bundledContentDirectory, entry.path);
                if (!absolute.startsWith(`${bundledContentDirectory}${path.sep}`)) {
                    throw new Error(`Bundled content path escapes its source directory: ${entry.path}`);
                }
                const content = await readFile(absolute, 'utf8');
                if (createHash('sha256').update(content).digest('hex') !== entry.sha256) {
                    throw new Error(`Bundled content checksum mismatch: ${entry.path}`);
                }
                return [entry.path, content];
            }));
            return {
                contents: `export default ${JSON.stringify(Object.fromEntries(entries))};`,
                loader: 'js',
                watchFiles: [manifestPath, ...manifest.files.map((entry) =>
                    path.join(bundledContentDirectory, entry.path))]
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
