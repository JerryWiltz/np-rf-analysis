// Modified: 2026-11-11
import { Linter } from 'eslint-linter-browserify';

export interface NpJsLintMessage {
    line: number;
    column: number;
    message: string;
}

interface AstNode {
    type?: string;
    name?: string;
    object?: AstNode;
    property?: AstNode;
    computed?: boolean;
    value?: unknown;
    left?: AstNode;
    callee?: AstNode;
}

interface ScopeDefinition {
    defs: unknown[];
}

interface Scope {
    upper: Scope | null;
    set: Map<string, ScopeDefinition>;
}

interface SourceCode {
    getScope(node: AstNode): Scope;
}

interface RuleContext {
    sourceCode: SourceCode;
    report(descriptor: { node: AstNode; message: string }): void;
}

interface PublicApiRule {
    meta: { type: 'problem' };
    create(context: RuleContext): Record<string, (node?: AstNode) => void>;
}

const linter = new Linter();
const baseConfig = {
    languageOptions: { ecmaVersion: 'latest' as const, sourceType: 'script' as const },
    rules: {
        'no-unexpected-multiline': ['warn'],
        'no-sequences': ['warn']
    }
};

function directMember(node: AstNode | undefined): string | null {
    if (node?.type !== 'MemberExpression'
        || node.object?.type !== 'Identifier'
        || node.object.name !== 'nP'
        || !node.property) return null;
    if (!node.computed && node.property.type === 'Identifier') return node.property.name ?? null;
    if (node.computed && node.property.type === 'Literal' && typeof node.property.value === 'string') {
        return node.property.value;
    }
    return null;
}

function hasLocalNP(sourceCode: SourceCode, node: AstNode): boolean {
    for (let scope: Scope | null = sourceCode.getScope(node); scope; scope = scope.upper) {
        if (scope.set.get('nP')?.defs.length) return true;
    }
    return false;
}

function publicApiRule(api: Record<string, unknown>): PublicApiRule {
    const callableNames = Object.keys(api).filter((name) => typeof api[name] === 'function');
    return {
        meta: { type: 'problem' },
        create(context: RuleContext) {
            const assignments = new Set<string>();
            const calls: Array<{ node: AstNode; name: string }> = [];
            return {
                AssignmentExpression(node: AstNode = {}) {
                    const name = directMember(node.left);
                    if (name && !hasLocalNP(context.sourceCode, node)) assignments.add(name);
                },
                CallExpression(node: AstNode = {}) {
                    const name = directMember(node.callee);
                    if (name && !hasLocalNP(context.sourceCode, node)) calls.push({ node, name });
                },
                'Program:exit'() {
                    for (const { node, name } of calls) {
                        if (assignments.has(name) || typeof api[name] === 'function') continue;
                        const suggestion = callableNames.find((candidate) =>
                            candidate.toLowerCase() === name.toLowerCase());
                        const message = Object.hasOwn(api, name)
                            ? `nP.${name} is not a function.`
                            : `Unknown nP API: nP.${name}().`;
                        context.report({
                            node: node.callee?.property ?? node,
                            message: suggestion ? `${message} Did you mean nP.${suggestion}()?` : message
                        });
                    }
                }
            };
        }
    };
}

export function lintNpJs(code: string, api: Record<string, unknown>): NpJsLintMessage[] {
    const config = [{
        ...baseConfig,
        plugins: { np: { rules: { 'public-api': publicApiRule(api) } } },
        rules: { ...baseConfig.rules, 'np/public-api': ['warn'] }
    }] as unknown as Parameters<typeof linter.verify>[1];
    const messages = linter.verify(code, config, { filename: 'npjs-example.js' });
    const multilineLines = new Set(messages
        .filter((message) => message.ruleId === 'no-unexpected-multiline')
        .map((message) => message.line));

    return messages
        .filter((message) => message.ruleId !== 'no-sequences' || !multilineLines.has(message.line))
        .map((message) => ({
            line: message.line,
            column: message.column,
            message: message.ruleId === 'no-unexpected-multiline' && message.messageId === 'property'
                ? `Unexpected continuation on this line. Check for a missing comma on line ${message.line - 1}.`
                : message.message
        }));
}
