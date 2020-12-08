import * as vscode from 'vscode';
import { Feature } from "./feature";
import { NoteGraph } from "../core";
import { letUserChooseTemplate } from "../vscode/Inputs";
import { createNote, openNoteInWorkspace } from "../vscode/NoteActions";
import { MarkdownLink } from "../core/Link";

const feature: Feature = {
    activate: (context: vscode.ExtensionContext, graph: NoteGraph) => {
        context.subscriptions.push(
            vscode.commands.registerCommand(
                'codekasten.create-note', 
                async () => {

                    const activeEditor: vscode.TextEditor | undefined = vscode.window.activeTextEditor;
                    const selection = activeEditor?.selection;
                    const selectionText: string | undefined = vscode.window.activeTextEditor.document.getText(selection);

                    const templatePath: string = await letUserChooseTemplate();
                    
                    if (selection !== undefined && !selection.isEmpty && selection.isSingleLine) {
                        var titleSuggestion: string = selectionText;
                    } else {
                        var titleSuggestion: string = '';
                    }
                    var title: string = await vscode.window.showInputBox({
                        prompt: `Enter the title...`, 
                        value: titleSuggestion
                    });

                    const filename: string = await vscode.window.showInputBox({
                        prompt: `Enter the filename for the new note`, 
                        value: convertToKebabCase(title) 
                    });

                    if (selection !== undefined && !selection.isEmpty && !selection.isSingleLine) {
                        var body: string = selectionText;
                    } else {
                        var body: string = '';
                    }
                    
                    const content: string = await createNoteContentFromTemplate(templatePath, {'title': title, 'body': body});
                    
                    const rootDir: string = vscode.workspace.workspaceFolders[0].uri.fsPath; 
                    var filePath: string = `${rootDir}/notes/${filename}.md`;
                    filePath = await createNote(filePath, content, false);
                    
                    const markdownLink: MarkdownLink = new MarkdownLink(activeEditor.document.uri.fsPath, filePath);
                    markdownLink.description = title;
                    activeEditor.edit(editBuilder => editBuilder.replace(selection, markdownLink.createStringRepresentation()));
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
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').replace(/\s+/g, '-').toLowerCase();
}

export default feature;