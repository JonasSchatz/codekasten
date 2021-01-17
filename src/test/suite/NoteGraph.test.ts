import * as assert from 'assert';
import * as vscode from 'vscode';

import { NoteGraph } from '../../core/note-graph';
import { CodekastenParser } from "./../../core";

suite('NoteGraph', () => {

    const rootDir: string = vscode.workspace.workspaceFolders[0]?.uri.fsPath; 

	test('Populate Graph', async () => {
        // Prepare
        const graph: NoteGraph = new NoteGraph();
	    const parser: CodekastenParser = new CodekastenParser();

        // Act
        const result = await graph.populateGraph(
            (await vscode.workspace.findFiles('**/*.md', '.codekasten')).map(uri => uri.fsPath), 
            parser
        );

        // Assert
        assert.strictEqual(graph.graph.nodes().length, 4);
	});
});
