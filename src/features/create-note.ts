import { ExtensionContext, Uri, workspace } from "vscode";
import { commands, window, TextEditor } from "vscode";
import * as path from "path";
import { Feature } from "./feature";
import { NoteGraph } from "../core";
import { letUserChooseTemplate } from "../vscode/Inputs";
import { StringDecoder } from "string_decoder";
import { createNote } from "../vscode/NoteActions";

const feature: Feature = {
    activate: (context: ExtensionContext, graph: NoteGraph) => {
        context.subscriptions.push(
            commands.registerCommand(
                'codekasten.create-note', 
                async () => {

                    const rootDir: string = workspace.workspaceFolders[0].uri.fsPath; 
                    const templatesDir: string = `${rootDir}/.codekasten/templates`;
                    
                    const activeEditor: TextEditor | undefined = window.activeTextEditor;
                    const selection = activeEditor?.selection;

                    const templatePath: string = await letUserChooseTemplate();
                    
                    var title: string = await window.showInputBox({
                        prompt: `Enter the title...`, 
                        value: window.activeTextEditor?.document?.getText(selection)
                    });

                    const filename: string = await window.showInputBox({
                        prompt: `Enter the filename for the new note`, 
                        value: convertToKebabCase(title) 
                    });

                    if (selection !== undefined && !selection.isEmpty && !selection.isSingleLine) {
                        var body: string = window.activeTextEditor.document.getText(selection);
                    } else {
                        var body: string = '';
                    }
                    
                    const content: string = await createNoteContentFromTemplate(templatePath, {'title': title, 'body': body});
                    
                    var filePath: string = `${rootDir}/notes/${filename}.md`;
                    filePath = await createNote(filePath, content, false);

                    //ToDo: Place Link back into the old note
                    //ToDo: Open the newly created note

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