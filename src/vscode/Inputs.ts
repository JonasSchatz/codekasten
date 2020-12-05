import * as vscode from 'vscode';
import { NoteGraph } from '../core';
import { Note } from '../core/Note';
import * as path from "path";

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
            const selectedNote: Note = graph.graph.node(selectedQuickPickItem.description);
            resolve(selectedNote);
        });
    });
    noteQuickPick.show();
    return noteQuickPickPromise;
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