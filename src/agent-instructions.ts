// Modified: 2026-11-18
import type { DataAdapter } from 'obsidian';

type AgentAdapter = Pick<DataAdapter, 'exists' | 'read' | 'write'>;
export type AgentInstallResult = 'created' | 'updated' | 'unchanged' | 'preserved';

export async function agentInstructionsHash(content: string): Promise<string> {
    const bytes = new TextEncoder().encode(content);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

// The adapter is necessary for assets inside Obsidian's hidden plugin directory.
export async function installAgentInstructions(
    adapter: AgentAdapter,
    pluginDirectory: string,
    instructions: string,
    checksum: string
): Promise<AgentInstallResult> {
    const segments = pluginDirectory.split('/');
    if (segments.length < 3 || segments.some((part) => !part || part === '.' || part === '..')
        || /[:\\]/.test(pluginDirectory) || segments[segments.length - 2] !== 'plugins') {
        throw new Error('Agent instructions require a vault-relative plugin directory.');
    }
    if (await agentInstructionsHash(instructions) !== checksum) {
        throw new Error('Bundled agent instructions failed checksum verification.');
    }
    const destination = `${pluginDirectory}/AGENTS.md`;
    const checksumPath = `${pluginDirectory}/AGENTS.sha256`;
    const exists = await adapter.exists(destination);
    if (exists) {
        const existing = await adapter.read(destination);
        if (existing === instructions) {
            if (!await adapter.exists(checksumPath) || await adapter.read(checksumPath) !== checksum) {
                await adapter.write(checksumPath, checksum);
            }
            return 'unchanged';
        }
        if (!await adapter.exists(checksumPath)
            || await agentInstructionsHash(existing) !== await adapter.read(checksumPath)) {
            return 'preserved';
        }
    }
    await adapter.write(destination, instructions);
    await adapter.write(checksumPath, checksum);
    return exists ? 'updated' : 'created';
}
