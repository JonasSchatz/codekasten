import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
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

export async function createNote(filePath: string, content: string, overwriteExisting: boolean): Promise<string> {
    if (fs.existsSync(filePath) && !overwriteExisting) {
        filePath = findUniqueFileName(filePath);
    }
    const writeBytes = Buffer.from(content, 'utf8');
    const uri = vscode.Uri.parse("file:///" + filePath);
    await vscode.workspace.fs.writeFile(uri, writeBytes);
    return filePath;
}

export function findUniqueFileName(filePath: string): string {
    var counter: number = 1;
    
    while (fs.existsSync(filePath)) {
        const trailingDigitRegex: RegExp = /_\d+$/;
        var parsedPath = path.parse(filePath);
        if(!parsedPath.name.match(trailingDigitRegex)) {
            parsedPath.name = parsedPath.name + '_1';
            parsedPath.base = parsedPath.name + parsedPath.ext;
        } else {
            parsedPath.name = parsedPath.name.replace(/_\d+$/, `_${counter}`);
            parsedPath.base = parsedPath.name + parsedPath.ext;
        }
        filePath = path.format(parsedPath);
        counter = counter + 1; 
    }
    return filePath; 
}

export async function loadFileAsString(fileIdentifier: string | vscode.Uri): Promise<string> {
    if(typeof fileIdentifier !== 'string') {
        var filePath: vscode.Uri = fileIdentifier;
    } else {
        var filePath: vscode.Uri = vscode.Uri.parse("file:///" + fileIdentifier);;
    }

    var readData = await vscode.workspace.fs.readFile(filePath);
    var readStr: string = Buffer.from(readData).toString('utf8');
    return readStr;
}