import * as vscode from 'vscode';
import { Feature } from "./feature";
import { NoteGraph } from "../core";
import { Note } from '../core/Note';
import { letUserSearchNoteByTitle, letUserChooseNoteAction } from '../vscode/Inputs';
import * as editorActions from '../vscode/EditorActions';

const feature: Feature = {
    activate: (context: vscode.ExtensionContext, graph: NoteGraph) => {
        context.subscriptions.push(
            vscode.commands.registerCommand(
                'codekasten.search-note', 
                async () => {
                    let note: Note = await letUserSearchNoteByTitle(graph);
                    let decision: string = await letUserChooseNoteAction();

                    if (decision === 'Insert Link') {
                        editorActions.insertMarkdownLinkInCurrentNote(note.path, note.title);
                    } else if (decision === 'Open Note') {
                        editorActions.openNoteInWorkspace(note.path);
                    } else {
                        vscode.window.showErrorMessage(`Unsupported action ${decision}`);
                    }

                }
            )
        );
    }
};

export default feature;