import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { findUniqueFileName } from '../../vscode/NoteActions';

suite('Extension Test Suite', () => {

    const rootDir: string = vscode.workspace.workspaceFolders[0]?.uri.fsPath; 

	test('findUniqueFileName', () => {
        // Prepare
        const filePaths = [
            path.join(rootDir, 'notes', 'test.md'), 
            path.join(rootDir, 'notes', 'test_1.md'), 
            path.join(rootDir, 'notes', 'definitely_a_unique_filename.md')
        ];

        const expectedFilePaths = [
            path.join(rootDir, 'notes', 'test_2.md'), 
            path.join(rootDir, 'notes', 'test_2.md'), 
            path.join(rootDir, 'notes', 'definitely_a_unique_filename.md')
        ];

        // Act
        const actualFilePaths = filePaths.map(findUniqueFileName);

        // Assert
        assert.deepStrictEqual(actualFilePaths, expectedFilePaths);
	});
});
