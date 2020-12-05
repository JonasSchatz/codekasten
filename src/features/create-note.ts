import { ExtensionContext, Uri, workspace } from "vscode";
import { commands, window, TextEditor } from "vscode";
import { Feature } from "./feature";
import { NoteGraph } from "../core";
import { letUserChooseTemplate } from "../vscode/Inputs";
import { createNote, openNoteInWorkspace } from "../vscode/NoteActions";
import { MarkdownLink } from "../core/Link";

const feature: Feature = {
    activate: (context: ExtensionContext, graph: NoteGraph) => {
        context.subscriptions.push(
            commands.registerCommand(
                'codekasten.create-note', 
                async () => {

                    const activeEditor: TextEditor | undefined = window.activeTextEditor;
                    const selection = activeEditor?.selection;
                    const selectionText: string | undefined = window.activeTextEditor.document.getText(selection);

                    const templatePath: string = await letUserChooseTemplate();
                    
                    if (selection !== undefined && !selection.isEmpty && selection.isSingleLine) {
                        var titleSuggestion: string = selectionText;
                    } else {
                        var titleSuggestion: string = '';
                    }
                    var title: string = await window.showInputBox({
                        prompt: `Enter the title...`, 
                        value: titleSuggestion
                    });

                    const filename: string = await window.showInputBox({
                        prompt: `Enter the filename for the new note`, 
                        value: convertToKebabCase(title) 
                    });

                    if (selection !== undefined && !selection.isEmpty && !selection.isSingleLine) {
                        var body: string = selectionText;
                    } else {
                        var body: string = '';
                    }
                    
                    const content: string = await createNoteContentFromTemplate(templatePath, {'title': title, 'body': body});
                    
                    const rootDir: string = workspace.workspaceFolders[0].uri.fsPath; 
                    var filePath: string = `${rootDir}/notes/${filename}.md`;
                    filePath = await createNote(filePath, content, false);
                    
                    const markdownLink: MarkdownLink = new MarkdownLink(activeEditor.document.uri.fsPath, filePath);
                    markdownLink.description = title;
                    activeEditor.edit(editBuilder => editBuilder.replace(selection, markdownLink.createStringRepresentation()));
                    openNoteInWorkspace(filePath);

                }
            )
        );
    }
};



async function createNoteContentFromTemplate(templatePath: string, placeholders: Record<string, string>): Promise<string> {
    const readData = await workspace.fs.readFile(Uri.file(templatePath));
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