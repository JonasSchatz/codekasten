import * as vscode from 'vscode';
import { Feature } from "./feature";
import { NoteGraph } from "../core";
import { letUserChooseTemplate, letUserChooseText } from "../vscode/Inputs";
import { createNote, openNoteInWorkspace } from "../vscode/NoteActions";
import { MarkdownLink } from "../core/Link";
import { Logger } from "../services";

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
                    
                    // InputBox: Title
                    try{
                        if (selection !== undefined && !selection.isEmpty && selection.isSingleLine) {
                            var titleSuggestion: string = selectionText;
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
                    var filePath: string = `${rootDir}/notes/${filename}.md`;
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
        .replace(/\W/g, '')
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/\s+/g, '-')
        .toLowerCase();
}

export default feature;