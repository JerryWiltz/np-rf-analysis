// Modified: 2026-07-25
import learningGuideAssets from 'learning-guide-assets';
import helloNPort from '../learning-guide/1 "Hello, nPort".md';
import understandingNpJs from '../learning-guide/2 Understanding an npjs Block.md';
import seriesRc from '../learning-guide/3 Series RC Example.md';
import typingNpJs from '../learning-guide/4 Typing in an npjs Block.md';
import basicAnalysisBlocks from '../learning-guide/5 The Basic Analysis Blocks.md';
import displayInputObjects from '../learning-guide/6 Display Input Objects.md';
import attenuator from '../learning-guide/7 A 3 dB Attenuator.md';
import microstripDivider from '../learning-guide/8 Microstrip Tee Power Divider.md';
import handLoading from '../learning-guide/100 Hand-loading the plugin into Obsidian.md';
import apiInventory from '../learning-guide/200 Complete List of nPort RF Constructors, Complex Numbers, and Matrices.md';

export const LEARNING_GUIDE_FOLDER = 'Getting Started';
export const LEARNING_GUIDE_START = '1 "Hello, nPort".md';
export const LEARNING_GUIDE_ASSETS = learningGuideAssets;

export interface LearningGuideLesson {
    path: string;
    content: string;
}

export const LEARNING_GUIDE_LESSONS: readonly LearningGuideLesson[] = [
    { path: LEARNING_GUIDE_START, content: helloNPort },
    { path: '2 Understanding an npjs Block.md', content: understandingNpJs },
    { path: '3 Series RC Example.md', content: seriesRc },
    { path: '4 Typing in an npjs Block.md', content: typingNpJs },
    { path: '5 The Basic Analysis Blocks.md', content: basicAnalysisBlocks },
    { path: '6 Display Input Objects.md', content: displayInputObjects },
    { path: '7 A 3 dB Attenuator.md', content: attenuator },
    { path: '8 Microstrip Tee Power Divider.md', content: microstripDivider },
    { path: '100 Hand-loading the plugin into Obsidian.md', content: handLoading },
    {
        path: '200 Complete List of nPort RF Constructors, Complex Numbers, and Matrices.md',
        content: apiInventory
    }
];
