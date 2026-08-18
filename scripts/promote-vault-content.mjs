// Modified: 2026-08-12
import {createHash} from 'node:crypto';
import {
    cp,
    mkdir,
    mkdtemp,
    readFile,
    readdir,
    rename,
    rm,
    stat,
    writeFile
} from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vaultRoot = path.resolve(repositoryRoot, '../np-rf-analysis-test-vault');
const destinationRoot = path.join(repositoryRoot, 'bundled-content');
const write = process.argv.includes('--write');

const learningSource = path.join(vaultRoot, '1 Learning nP');
const examplesSource = path.join(vaultRoot, 'Examples');
const lessonImagesSource = path.join(vaultRoot, 'Images', '1 Learning nP SVG');
const exampleImagesSource = path.join(vaultRoot, 'Images', 'Examples SVG');
const symbolsSource = path.join(vaultRoot, 'Images', 'Symbol Library SVG');
const toolsSource = path.join(vaultRoot, 'schematics');

function normalizeText(value) {
    return value.replaceAll('\r\n', '\n');
}

function transformLearningMarkdown(value) {
    return normalizeText(value)
        .replaceAll('Images/1 Learning nP SVG/', 'Getting Started/Images/')
        .replaceAll(
            'Images/Symbol Library SVG/',
            'Getting Started/Schematic Authoring/Symbols/'
        );
}

function transformExampleMarkdown(value) {
    return normalizeText(value)
        .replaceAll('Images/Examples SVG/', 'Examples/Images/')
        .replaceAll(
            'Images/Symbol Library SVG/',
            'Getting Started/Schematic Authoring/Symbols/'
        );
}

async function filesBelow(root, predicate = () => true) {
    const output = [];
    async function walk(directory) {
        for (const entry of await readdir(directory, {withFileTypes: true})) {
            const absolute = path.join(directory, entry.name);
            if (entry.isDirectory()) await walk(absolute);
            else if (entry.isFile() && predicate(absolute)) output.push(absolute);
        }
    }
    await walk(root);
    return output.sort();
}

async function copyFileInto(source, stagingRoot, relative, transform) {
    const destination = path.join(stagingRoot, relative);
    await mkdir(path.dirname(destination), {recursive: true});
    if (transform) {
        await writeFile(destination, transform(await readFile(source, 'utf8')), 'utf8');
    } else {
        await cp(source, destination, {preserveTimestamps: true});
    }
}

async function buildStaging(stagingRoot) {
    const lessons = await filesBelow(learningSource, file => file.endsWith('.md'));
    for (const source of lessons) {
        if (path.basename(source) === 'AGENTS.md') continue;
        await copyFileInto(
            source,
            stagingRoot,
            path.join('Getting Started', path.relative(learningSource, source)),
            transformLearningMarkdown
        );
    }

    for (const source of await filesBelow(examplesSource, file => file.endsWith('.md'))) {
        await copyFileInto(
            source,
            stagingRoot,
            path.join('Examples', path.relative(examplesSource, source)),
            transformExampleMarkdown
        );
    }

    for (const source of await filesBelow(lessonImagesSource, file => file.endsWith('.svg'))) {
        await copyFileInto(
            source,
            stagingRoot,
            path.join('Getting Started', 'Images', path.basename(source))
        );
    }
    for (const source of await filesBelow(exampleImagesSource, file => file.endsWith('.svg'))) {
        await copyFileInto(
            source,
            stagingRoot,
            path.join('Examples', 'Images', path.basename(source))
        );
    }
    for (const source of await filesBelow(symbolsSource, file => file.endsWith('.svg'))) {
        await copyFileInto(
            source,
            stagingRoot,
            path.join('Getting Started', 'Schematic Authoring', 'Symbols', path.basename(source))
        );
    }

    await copyFileInto(
        path.join(vaultRoot, 'Images', 'AGENTS.md'),
        stagingRoot,
        path.join('Getting Started', 'Schematic Authoring', 'AGENTS.md'),
        normalizeText
    );
    await copyFileInto(
        path.join(toolsSource, 'README.md'),
        stagingRoot,
        path.join('Getting Started', 'Schematic Authoring', 'README.md'),
        value => normalizeText(value)
            .replaceAll('Images/Symbol Library SVG/', 'Getting Started/Schematic Authoring/Symbols/')
            .replaceAll('schematics/', 'Getting Started/Schematic Authoring/Tools/')
    );
    for (const filename of [
        'compose-schematic.js',
        'symbol-library.js',
        'validate-schematic.js',
        'validate-symbol-library.js'
    ]) {
        await copyFileInto(
            path.join(toolsSource, filename),
            stagingRoot,
            path.join('Getting Started', 'Schematic Authoring', 'Tools', filename)
        );
    }

    const manifestEntries = [];
    for (const file of await filesBelow(stagingRoot)) {
        const content = await readFile(file);
        manifestEntries.push({
            path: path.relative(stagingRoot, file).split(path.sep).join('/'),
            sha256: createHash('sha256').update(content).digest('hex')
        });
    }
    await writeFile(
        path.join(stagingRoot, 'content-manifest.json'),
        `${JSON.stringify({version: 1, files: manifestEntries}, null, 2)}\n`,
        'utf8'
    );
}

async function directoryDigest(root) {
    try {
        if (!(await stat(root)).isDirectory()) return '';
    } catch {
        return '';
    }
    const digest = createHash('sha256');
    for (const file of await filesBelow(root)) {
        digest.update(path.relative(root, file).split(path.sep).join('/'));
        digest.update('\0');
        digest.update(await readFile(file));
        digest.update('\0');
    }
    return digest.digest('hex');
}

const temporaryRoot = await mkdtemp(path.join(os.tmpdir(), 'np-content-promotion-'));
const stagingRoot = path.join(temporaryRoot, 'bundled-content');
await mkdir(stagingRoot);
try {
    await buildStaging(stagingRoot);
    const expected = await directoryDigest(stagingRoot);
    const current = await directoryDigest(destinationRoot);
    if (!write) {
        if (expected !== current) {
            process.stderr.write('Bundled educational content is out of date. Run npm run content:promote.\n');
            process.exitCode = 1;
        } else {
            process.stdout.write('Bundled educational content matches the authoring vault.\n');
        }
    } else {
        const backup = path.join(temporaryRoot, 'previous-bundled-content');
        try {
            await rename(destinationRoot, backup);
        } catch (error) {
            if (error.code !== 'ENOENT') throw error;
        }
        await rename(stagingRoot, destinationRoot);
        process.stdout.write(`Promoted bundled content to ${destinationRoot}\n`);
    }
} finally {
    await rm(temporaryRoot, {recursive: true, force: true});
}
