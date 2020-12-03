import * as vscode from 'vscode';
import { MarkdownLink } from '../core/Link';

export function insertTextInCurrentNote(text: string) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
        const position = editor.selection.active;
        editor.edit(editBuilder => editBuilder.insert(position, text));
    }
};

export function insertMarkdownLinkInCurrentNote(targetPath: string, title: string) {
    const sourcePath: string = vscode.window.activeTextEditor.document.uri.fsPath;
    const markdownLink: MarkdownLink = new MarkdownLink(sourcePath, targetPath);
    markdownLink.description = title;
    const stringRepresentation: string = markdownLink.createStringRepresentation();
    insertTextInCurrentNote(stringRepresentation);
}

export function openNoteInWorkspace(path: string) {
    var uri: vscode.Uri = vscode.Uri.parse("file:///" + path);
    vscode.workspace.openTextDocument(uri).then(doc => {
        vscode.window.showTextDocument(doc);
    });
}