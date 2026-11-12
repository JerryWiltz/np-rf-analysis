// Modified: 2026-11-11
import bundledEducationalContent from 'bundled-educational-content';

export const EDUCATIONAL_CONTENT_ROOT = 'nPort RF Analysis';
export const EXAMPLES_FOLDER = 'Examples';
export const EXAMPLES_START = 'Examples Home.md';
export const EDUCATIONAL_CONTENT_FILES = bundledEducationalContent;
export const RELEASE_NOTES_FOLDER = Object.keys(EDUCATIONAL_CONTENT_FILES)
    .find((relativePath) => relativePath.startsWith("What's new in version "))
    ?.split('/')[0] ?? '';
