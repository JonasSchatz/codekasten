import * as assert from 'assert';
import * as vscode from 'vscode';
import { NoteGraph } from './../../core/NoteGraph';
import { CodekastenParser } from "./../../vscode";

suite('NoteGraph', () => {

    const rootDir: string = vscode.workspace.workspaceFolders[0]?.uri.fsPath; 

	test('Populate Graph', async () => {
        // Prepare
        const graph: NoteGraph = new NoteGraph();
	    const parser: CodekastenParser = new CodekastenParser();

        // Act
        const result = await graph.populateGraph(vscode.workspace.findFiles('**/*.md', '.codekasten'), parser);

        // Assert
        assert.strictEqual(graph.graph.nodes().length, 4);
	});
});
