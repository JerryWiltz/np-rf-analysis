// Modified: 2026-11-12
import {createHash} from 'node:crypto';
import {cp, mkdir, mkdtemp, readFile, readdir, rename, rm, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {examples} from '../../nP/docs/.vitepress/theme/replExamples.js';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const replSourcePath = path.resolve(repositoryRoot, '../nP/docs/.vitepress/theme/replExamples.js');
const pluginContentRoot = path.join(repositoryRoot, 'nPort-plugin-content');
const examplesRoot = path.join(pluginContentRoot, 'Examples');
const packageJson = JSON.parse(await readFile(path.join(repositoryRoot, 'package.json'), 'utf8'));
if (!/^\d+\.\d+\.\d+$/.test(packageJson.version)) {
    throw new Error('The plugin version must use x.y.z format before promoting release notes.');
}
const releaseNotesFolder = `What's new in version ${packageJson.version}`;
const releaseNotesRoot = path.join(pluginContentRoot, releaseNotesFolder);
const manifestPath = path.join(pluginContentRoot, 'content-manifest.json');
const write = process.argv.includes('--write');

function sha256(content) {
    return createHash('sha256').update(content).digest('hex');
}

async function filesBelow(root) {
    const files = [];
    for (const entry of await readdir(root, {withFileTypes: true})) {
        const absolute = path.join(root, entry.name);
        if (entry.isDirectory()) files.push(...await filesBelow(absolute));
        else if (entry.isFile()) files.push(absolute);
    }
    return files.sort();
}

const sourceText = await readFile(replSourcePath, 'utf8');
if (!Array.isArray(examples) || examples.length === 0) {
    throw new Error('The nP REPL example source did not export an examples array.');
}

const ids = new Set();
for (const example of examples) {
    if (!example || typeof example.id !== 'string' || !/^[a-z0-9-]+$/.test(example.id)
        || typeof example.title !== 'string' || typeof example.code !== 'string'
        || !example.code.trim() || ids.has(example.id)) {
        throw new Error('The nP REPL examples must have unique IDs, titles, and runnable code.');
    }
    ids.add(example.id);
}

const temporaryRoot = await mkdtemp(path.join(repositoryRoot, '.np-repl-promotion-'));
const stagingRoot = path.join(temporaryRoot, 'content');
const stagingExamplesRoot = path.join(stagingRoot, 'Examples');
const stagingReleaseNotesRoot = path.join(stagingRoot, releaseNotesFolder);
await mkdir(stagingExamplesRoot, {recursive: true});
await mkdir(stagingReleaseNotesRoot, {recursive: true});
try {
    const records = [];
    for (const [index, example] of examples.entries()) {
        const number = String(index + 1).padStart(2, '0');
        const filename = `${number} ${example.title}.md`;
        const relativePath = `Examples/${filename}`;
        const sourceUrl = `https://jerrywiltz.github.io/nP/repl.html#example-${example.id}`;
        const content = [
            `<!-- Generated from nP REPL example ${example.id}; do not edit the copied code here. -->`,
            '',
            `# ${number} ${example.title}`,
            '',
            `[Open this example in the nP REPL](${sourceUrl})`,
            '',
            'This JavaScript is copied verbatim from the nP REPL. Select **Run** to execute it; the plugin checks syntax and direct nP API calls first.',
            '',
            '```npjs',
            example.code.replace(/\s+$/, ''),
            '```',
            ''
        ].join('\n');
        await writeFile(path.join(stagingExamplesRoot, filename), content, 'utf8');
        records.push({
            order: index + 1,
            id: example.id,
            title: example.title,
            category: example.category ?? 'examples',
            path: relativePath,
            sha256: sha256(content)
        });
    }

    const indexLines = [
        '# nP REPL examples',
        '',
        'These notes reproduce every starter example in the nP REPL, in its current order. The REPL is the source of truth; rerun the promotion command after changing its example list.',
        '',
        ...records.map((record) => `${String(record.order).padStart(2, '0')}. [[${path.basename(record.path, '.md')}]]`),
        ''
    ];
    const indexContent = indexLines.join('\n');
    await writeFile(path.join(stagingExamplesRoot, 'Examples Home.md'), indexContent, 'utf8');

    const releaseFiles = await filesBelow(releaseNotesRoot);
    if (releaseFiles.length === 0 || releaseFiles.some((file) => !file.endsWith('.md'))) {
        throw new Error(`Expected Markdown release notes in nPort-plugin-content/${releaseNotesFolder}.`);
    }
    for (const source of releaseFiles) {
        const relative = path.relative(repositoryRoot, source);
        const destination = path.join(stagingRoot, path.relative(pluginContentRoot, source));
        await mkdir(path.dirname(destination), {recursive: true});
        await cp(source, destination);
        if (!relative.startsWith('nPort-plugin-content/')) {
            throw new Error(`Release-note path escapes the plugin repository: ${source}`);
        }
    }

    const stagedFiles = await filesBelow(stagingRoot);
    const fileRecords = await Promise.all(stagedFiles.map(async (file) => {
        const relativePath = path.relative(stagingRoot, file).split(path.sep).join('/');
        return {
            path: relativePath,
            sha256: sha256(await readFile(file))
        };
    }));

    const manifest = {
        version: 2,
        pluginVersion: packageJson.version,
        releaseNotesFolder,
        source: {
            repository: 'nP',
            path: 'docs/.vitepress/theme/replExamples.js',
            sha256: sha256(sourceText)
        },
        examples: records,
        files: fileRecords.sort((left, right) => left.path.localeCompare(right.path))
    };
    const manifestContent = `${JSON.stringify(manifest, null, 2)}\n`;
    await writeFile(path.join(temporaryRoot, 'content-manifest.json'), manifestContent, 'utf8');

    if (!write) {
        const currentFiles = await Promise.all(manifest.files.map(async ({path: relativePath}) => {
            const current = path.join(pluginContentRoot, relativePath);
            return {path: relativePath, content: await readFile(current, 'utf8').catch(() => null)};
        }));
        const expectedFiles = await Promise.all(manifest.files.map(async ({path: relativePath}) => ({
            path: relativePath,
            content: await readFile(path.join(stagingRoot, relativePath), 'utf8')
        })));
        const currentManifest = await readFile(manifestPath, 'utf8').catch(() => '');
        const currentExamples = await filesBelow(examplesRoot).catch(() => []);
        const currentReleaseNotes = await filesBelow(releaseNotesRoot).catch(() => []);
        const currentManagedPaths = [...currentExamples, ...currentReleaseNotes]
            .map((file) => path.relative(pluginContentRoot, file).split(path.sep).join('/'))
            .sort();
        const expectedManagedPaths = manifest.files.map((entry) => entry.path).sort();
        let matches = currentManifest === manifestContent
            && JSON.stringify(currentManagedPaths) === JSON.stringify(expectedManagedPaths);
        for (let index = 0; matches && index < expectedFiles.length; index += 1) {
            const expected = expectedFiles[index];
            const current = currentFiles[index];
            matches = expected !== undefined && current !== undefined
                && current.path === expected.path && current.content === expected.content;
        }
        if (!matches) {
            process.stderr.write('Bundled examples or release notes are out of date. Run npm run content:promote.\n');
            process.exitCode = 1;
        } else {
            process.stdout.write(`Verified ${records.length} ordered REPL examples and version ${packageJson.version} release notes.\n`);
        }
    } else {
        const targets = [
            {source: examplesRoot, staged: stagingExamplesRoot},
            {source: releaseNotesRoot, staged: stagingReleaseNotesRoot},
            {source: manifestPath, staged: path.join(temporaryRoot, 'content-manifest.json')}
        ];
        const backups = [];
        try {
            for (const [index, target] of targets.entries()) {
                const backup = path.join(temporaryRoot, `backup-${index}`);
                try {
                    await rename(target.source, backup);
                    backups.push({source: target.source, backup});
                } catch (error) {
                    if (error.code !== 'ENOENT') throw error;
                }
                await rename(target.staged, target.source);
            }
        } catch (error) {
            for (const target of targets) {
                await rm(target.source, {recursive: true, force: true});
            }
            for (const backup of backups.reverse()) await rename(backup.backup, backup.source);
            throw error;
        }
        process.stdout.write(`Promoted ${records.length} ordered REPL examples and release notes for ${packageJson.version}.\n`);
    }
} finally {
    await rm(temporaryRoot, {recursive: true, force: true});
}
