import * as fs from 'fs';
import * as md5 from 'md5';
import * as path from "path";
import * as vscode from 'vscode';

import { NoteGraph, Note } from '../core';

export function letUserSearchNoteByTitle(graph: NoteGraph): Promise<Note> {
    const noteQuickPick = vscode.window.createQuickPick();
    noteQuickPick.placeholder = "Type term to start searching...";
    noteQuickPick.onDidHide(() => noteQuickPick.dispose());
    noteQuickPick.onDidChangeValue( (quickPickValue) => {
        const notes: Note[] = graph.searchInTitle(quickPickValue); 
        noteQuickPick.items = notes.map(note => {return {label: note.title, description: note.path};});   
    });

    var noteQuickPickPromise = new Promise<Note>(resolve => {
        noteQuickPick.onDidAccept( () => {
            const selectedQuickPickItem: vscode.QuickPickItem = noteQuickPick.selectedItems[0];
            const id: string = md5(selectedQuickPickItem.description);
            const selectedNote: Note = graph.graph.node(id);
            if(!selectedNote) {
                const path: string = selectedQuickPickItem.description;
                vscode.window.showErrorMessage(`Could not retrieve Note with id ${id} from ${path}`);
            }
            resolve(selectedNote);
        });
    });
    noteQuickPick.show();
    return noteQuickPickPromise;
}

export async function letUserChooseText(prompt: string, value: string = ''): Promise<string> {
    const inputBox = vscode.window.createInputBox();
    inputBox.prompt = prompt;
    inputBox.value = value;
    inputBox.onDidHide(() => inputBox.dispose());

    var inputBoxPromise = new Promise<string>(resolve => {
        inputBox.onDidAccept( () => {
            resolve(inputBox.value);
        });
    });
    inputBox.show();
    return inputBoxPromise;
}

export async function letUserChooseNoteAction(): Promise<string> {
    const actionQuickPickItems = [{label: 'Insert Link'}, {label: 'Open Note'}]; // ToDo: Remove magic strings
    const selectedQuickPickItem = await vscode.window.showQuickPick(actionQuickPickItems, {placeHolder: "Choose action..."});
    return selectedQuickPickItem.label;
}

export async function letUserChooseTemplate(): Promise<string> {
    const templateUris: vscode.Uri[] = await vscode.workspace.findFiles('.codekasten/templates/**.md');
    const templateQuickPickItems = templateUris.map(
        uri => {
            return {label: path.basename(uri.fsPath), description: uri.fsPath};
        }
    );
    const selectedQuickPickItem: vscode.QuickPickItem = await vscode.window.showQuickPick(templateQuickPickItems);
    return selectedQuickPickItem.description;
}

export async function letUserChooseFolder(): Promise<string> {
    const rootFolder: string = vscode.workspace.workspaceFolders[0].uri.fsPath; 
    const folders: string[] = fs.readdirSync(rootFolder, {withFileTypes: true})
        .filter(dirent => dirent.isDirectory() && !['.codekasten', '.vscode'].includes(dirent.name) ) // ToDo: Put this in settings
        .map(dirent => dirent.name);
    const filterQuickPickItems: vscode.QuickPickItem[] = folders.map(folder => {
        return {label: folder};
    });
    const selectedQuickPickItem: vscode.QuickPickItem = await vscode.window.showQuickPick(filterQuickPickItems);
    return selectedQuickPickItem.label;
}