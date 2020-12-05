import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import { findUniqueFileName } from '../../vscode/NoteActions';

suite('NoteActions', () => {

    const rootDir: string = vscode.workspace.workspaceFolders[0]?.uri.fsPath; 
    
    test('findUniqueFileName: Keep already unique name', () => {
        // Prepare
        const filePath = path.join(rootDir, 'notes', 'definitely_a_unique_filename.md');
        const expectedFilePath = path.join(rootDir, 'notes', 'definitely_a_unique_filename.md');

        // Act
        const actualFilePath = findUniqueFileName(filePath);

        // Assert
        assert.strictEqual(actualFilePath, expectedFilePath);
    });

    test('findUniqueFileName: Increment Once', () => {
        // Prepare
        const filePath = path.join(rootDir, 'notes', 'test.md');
        const expectedFilePath = path.join(rootDir, 'notes', 'test_2.md');

        // Act
        const actualFilePath = findUniqueFileName(filePath);

        // Assert
        assert.strictEqual(actualFilePath, expectedFilePath);
    });

    test('findUniqueFileName: Increment Twice', () => {
        // Prepare
        const filePath = path.join(rootDir, 'notes', 'test_1.md');
        const expectedFilePath = path.join(rootDir, 'notes', 'test_2.md');

        // Act
        const actualFilePath = findUniqueFileName(filePath);

        // Assert
        assert.strictEqual(actualFilePath, expectedFilePath);
    });
});
