import * as assert from 'assert';
import * as vscode from 'vscode';
import { MarkdownLink } from '../../core/Link';
import { loadFileAsString } from '../../vscode/NoteActions';
import { CodekastenParser } from "./../../vscode";
import * as path from 'path';

suite('CodekastenParser', () => {

    const rootDir: string = vscode.workspace.workspaceFolders[0]?.uri.fsPath; 

	test('Parse Links', async () => {
        // Prepare
        const parser: CodekastenParser = new CodekastenParser();
        const filePath: string = path.resolve(__dirname, './../../../src/test/fixture/notes/test.md');
        const text: string = await loadFileAsString(filePath);

        // Act
        const {links, backlinks}: {links: MarkdownLink[], backlinks: MarkdownLink[]} = parser.parseLinks(text, filePath);

        // Assert
        for (const link of links) {
            assert.strictEqual(link.description, 'Forward Link');
        }

        for (const backlink of backlinks) {
            assert.strictEqual(backlink.description, 'Backward Link');
        }
	});
});
