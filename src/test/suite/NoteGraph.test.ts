import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { NoteGraph } from './../../core/NoteGraph';
import { CodekastenParser } from "./../../vscode";

suite('Extension Test Suite', () => {

    const rootDir: string = vscode.workspace.workspaceFolders[0]?.uri.fsPath; 

	test('Populate Graph', async () => {
        // Prepare
        const graph: NoteGraph = new NoteGraph();
	    const parser: CodekastenParser = new CodekastenParser();

        // Act
        const result = await graph.populateGraph(vscode.workspace.findFiles('**/*.md', '.codekasten'), parser);

        // Assert
        assert.strictEqual(graph.graph.nodes().length, 3);
	});
});
