import * as assert from 'assert';
import * as vscode from 'vscode';
import { MarkdownLink } from '../../core/Link';
import { loadFileAsString } from '../../vscode/NoteActions';
import { CodekastenParser } from "./../../vscode";
import * as path from 'path';

suite('CodekastenParser', () => {

    async function getLinksForTest(): Promise<{links: MarkdownLink[], backlinks: MarkdownLink[]}> {
        const parser: CodekastenParser = new CodekastenParser();
        const filePath: string = path.resolve(__dirname, './../../../src/test/fixture/notes/test.md');
        const text: string = await loadFileAsString(filePath);
        return parser.parseLinks(text, filePath);
    }

	test('Parse Links: Forward', async () => {
        // Prepare & Act
        const {links, backlinks}: {links: MarkdownLink[], backlinks: MarkdownLink[]} = await getLinksForTest();

        // Assert
        for (const link of links) {
            assert.strictEqual(link.description, 'Forward Link');
        }
    });
    
    test('Parse Links: Backward', async () => {
        // Prepare & Act
        const {links, backlinks}: {links: MarkdownLink[], backlinks: MarkdownLink[]} = await getLinksForTest();

        // Assert
        for (const link of backlinks) {
            assert.strictEqual(link.description, 'Backward Link');
        }
    });
    
    test('Parse Links: Ignore Hyperlinks', async () => {
       // Prepare & Act
       const {links, backlinks}: {links: MarkdownLink[], backlinks: MarkdownLink[]} = await getLinksForTest();

        // Assert
        for (const link of links.concat(backlinks)) {
            assert.notStrictEqual(link.description, 'Hyperlink');
        }
    });
    
    test('Parse Links: Ignore Images', async () => {
        // Prepare & Act
        const {links, backlinks}: {links: MarkdownLink[], backlinks: MarkdownLink[]} = await getLinksForTest();

        // Assert
        for (const link of links.concat(backlinks)) {
            assert.notStrictEqual(link.description, 'Image');
        }
	});
});
