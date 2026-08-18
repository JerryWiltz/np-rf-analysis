// Modified: 2026-08-18
import obsidianmd from 'eslint-plugin-obsidianmd';
import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig(
    globalIgnores([
        'node_modules',
        'vendor',
        'bundled-content',
        'test',
        'main.js',
        'esbuild.config.mjs',
        'package.json',
        'package-lock.json',
        'tsconfig.json',
        'versions.json'
    ]),
    {
        languageOptions: {
            globals: {
                ...globals.browser
            },
            parserOptions: {
                projectService: {
                    allowDefaultProject: [
                        'eslint.config.mjs',
                        'scripts/promote-vault-content.mjs',
                        'scripts/verify-release.mjs',
                        'manifest.json'
                    ]
                },
                tsconfigRootDir: import.meta.dirname,
                extraFileExtensions: ['.json']
            }
        }
    },
    ...obsidianmd.configs.recommended
);
