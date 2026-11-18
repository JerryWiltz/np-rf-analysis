// Modified: 2026-11-18
import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);

export async function verifyBundledAgent(main, content, checksum) {
    const notices = [];
    const errors = [];
    class Plugin {
        constructor(app, manifest) { this.app = app; this.manifest = manifest; }
        async loadData() { return null; }
        async saveData() { throw new Error('Startup must not rewrite saved results.'); }
        registerEditorExtension() {}
        addSettingTab() {}
        addCommand() {}
        registerMarkdownCodeBlockProcessor() {}
        registerEvent() {}
        registerInterval() {}
        register() {}
    }
    const obsidian = {
        Plugin,
        PluginSettingTab: class {},
        MarkdownRenderChild: class {},
        TFile: class {},
        Notice: class { constructor(message) { notices.push(message); } },
        normalizePath: (value) => value.replace(/\\/g, '/').replace(/\/{2,}/g, '/').replace(/^\/|\/$/g, '')
    };
    const module = {exports: {}};
    vm.runInNewContext(main, {
        module, exports: module.exports,
        require: (name) => name === 'obsidian' ? obsidian : require(name),
        console: {...console, error: (...values) => errors.push(values)},
        crypto: webcrypto, TextEncoder, TextDecoder,
        window: {setInterval: () => 1, clearTimeout: () => undefined},
        setTimeout, clearTimeout
    }, {timeout: 10000});
    const BuiltPlugin = module.exports.default;
    const directory = '.release-test-config/plugins/np-rf-analysis';
    const destination = `${directory}/AGENTS.md`;
    const marker = `${directory}/AGENTS.sha256`;
    const originalRoot = '# Vault instructions\n';
    const originalClaude = '# Claude instructions\n';
    const files = new Map([['AGENTS.md', originalRoot], ['CLAUDE.md', originalClaude]]);
    let writes = [];
    let failWrites = false;
    const adapter = {
        async exists(path) { return files.has(path); },
        async read(path) { assert.ok(files.has(path)); return files.get(path); },
        async write(path, text) {
            if (failWrites) throw new Error('Read-only plugin directory');
            writes.push(path);
            files.set(path, text);
        }
    };
    async function load(configDir = '.release-test-config', manifestDir) {
        const app = {
            vault: {configDir, adapter, on: () => ({})},
            workspace: {on: () => ({}), onLayoutReady: () => undefined}
        };
        const plugin = new BuiltPlugin(app, {id: 'np-rf-analysis', dir: manifestDir});
        await plugin.onload();
    }
    await load();
    assert.equal(files.get(destination), content, 'Production bundle must install the complete matching agent');
    assert.equal(files.get(marker), checksum);
    assert.equal(writes.length, 2);
    writes = [];
    await load();
    assert.deepEqual(writes, [], 'Reload must not rewrite matching assets');

    const previous = '# Previous bundled agent\n';
    files.set(destination, previous);
    files.set(marker, createHash('sha256').update(previous).digest('hex'));
    await load();
    assert.equal(files.get(destination), content, 'Unedited previous agent must update');
    const custom = '# My customized instructions\n';
    files.set(destination, custom);
    writes = [];
    await load();
    assert.equal(files.get(destination), custom);
    assert.deepEqual(writes, [], 'Edited agent must be preserved');
    assert.ok(notices.some((message) => message.includes('preserved')));

    await load('.ignored-config', directory);
    await load('.custom-config');
    assert.equal(files.get('.custom-config/plugins/np-rf-analysis/AGENTS.md'), content);
    assert.equal(files.get('AGENTS.md'), originalRoot);
    assert.equal(files.get('CLAUDE.md'), originalClaude);
    failWrites = true;
    await load('.read-only');
    assert.equal(errors.length, 1, 'Install failure must be reported without rejecting plugin startup');
    assert.ok(notices.some((message) => message.includes('circuit analysis remains available')));
    assert.ok([...files.keys()].every((key) => key === 'AGENTS.md' || key === 'CLAUDE.md'
        || key.startsWith(`${directory}/`) || key.startsWith('.custom-config/plugins/np-rf-analysis/')));
}
