import * as vscode from 'vscode';

import { NoteGraph, MarkdownLink } from "../core";
import { letUserChooseFolder, letUserChooseTemplate, letUserChooseText } from "../vscode/Inputs";
import { createNote, openNoteInWorkspace } from "../vscode/NoteActions";

import { Feature } from "./feature";


const feature: Feature = {
    activate: (context: vscode.ExtensionContext, graph: NoteGraph) => {
        context.subscriptions.push(
            vscode.commands.registerCommand(
                'codekasten.create-note', 
                async () => {

                    const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
                    const selection = activeEditor?.selection;
                    const selectionText: string | undefined = vscode.window.activeTextEditor?.document?.getText(selection);
                    
                    // QuickPick: Template
                    try {
                        var templatePath: string = await letUserChooseTemplate();
                    } catch(err) {
                        return;
                    }

                    // QuickPick: Folder
                    try {
                        var folder: string = await letUserChooseFolder();
                    } catch(err) {
                        return;
                    }
                    
                    // InputBox: Title
                    try{
                        if (selection !== undefined && !selection.isEmpty && selection.isSingleLine) {
                            var titleSuggestion: string = selectionText;
                        } else if (folder === 'dailynotes') {
                            var titleSuggestion: string = new Date().toISOString().split('T')[0];
                        } else {
                            var titleSuggestion: string = '';
                        }
                        var title: string = await letUserChooseText('Please enter the title...', titleSuggestion); 
                    } catch(err) {
                        return;
                    }

                    // InputBox: FileName
                    try{
                        var filename: string = await letUserChooseText('Enter the filename for the new note', convertToKebabCase(title));
                    } catch(err) {
                        return; 
                    }

                    if (selection !== undefined && !selection.isEmpty && !selection.isSingleLine) {
                        var body: string = selectionText;
                    } else {
                        var body: string = '';
                    }
                    
                    const content: string = await createNoteContentFromTemplate(templatePath, {'title': title, 'body': body});
                    
                    const rootDir: string = vscode.workspace.workspaceFolders[0].uri.fsPath; 
                    var filePath: string = `${rootDir}/${folder}/${filename}.md`;
                    filePath = await createNote(filePath, content, false);
                    
                    // If there was an non-empty selection: Insert a markdown link instead of the selection
                    if (selection !== undefined && !selection.isEmpty) {
                        const markdownLink: MarkdownLink = new MarkdownLink(activeEditor.document.uri.fsPath, filePath);
                        markdownLink.description = title;
                        activeEditor.edit(editBuilder => editBuilder.replace(selection, markdownLink.getStringRepresentation()));
                    }
                    
                    openNoteInWorkspace(filePath, vscode.ViewColumn.Active);

                }
            )
        );
    }
};


async function createNoteContentFromTemplate(templatePath: string, placeholders: Record<string, string>): Promise<string> {
    const readData = await vscode.workspace.fs.readFile(vscode.Uri.file(templatePath));
    var readStr: string = Buffer.from(readData).toString('utf8');
    for (var key in placeholders) {
        readStr = readStr.replace(`{${key}}`, placeholders[key]); //ToDo: Avoid loss of data!
    }
    return readStr;
}

function convertToKebabCase(str: string): string {
    return str
        .replace(/[^a-zA-Z0-9_-\s]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .toLowerCase();
}

export default feature;