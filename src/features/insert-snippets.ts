import * as vscode from 'vscode';

import { NoteGraph } from "../core";
import { insertTextInCurrentNote } from '../vscode/note-actions';

import { Feature } from "./feature";


const snippets = [
    {
        label: 'HTML Snippets', 
        content: [
            {
                label: 'Two-column HTML table', 
                content:  "<table><tr><td>\n\n\n</td><td>\n\n\n</td></tr></table>"
            }, {
                label: 'Two-column HTML row', 
                content: "</td></tr><tr><td>\n\n\n</td><td>\n\n"
            }
        ]
    }, {
        label: 'Emojis', 
        content: [
            {
                label: 'Rejection', 
                content: '❌'
            }, {
                label: 'Waiting', 
                content: '🕒'
            }, {
                label: 'Checkmark', 
                content: '✔️'
            }
        ]
    }
];

const feature: Feature = {
    activate: (context: vscode.ExtensionContext, graph: NoteGraph) => {
        context.subscriptions.push(
            vscode.commands.registerCommand(
                'codekasten.insert-snippet', 
                async () => {
                    
                    let options = snippets;
                    while (true) {
                        const quickPickItems: vscode.QuickPickItem[] = options.map( optionElement => {
                            if (typeof optionElement.content === 'string') {
                                return {label: optionElement.label, description: optionElement.content};
                            } else {
                                return {label: optionElement.label};
                            }
                        });
                        const selectedItem: vscode.QuickPickItem = await vscode.window.showQuickPick(quickPickItems, {placeHolder: "Choose Snippet/Category..."});
                        const selectedItemContent: string | any[] = options.filter(x => x.label === selectedItem.label)[0].content;

                        if (typeof selectedItemContent === 'string') {
                            insertTextInCurrentNote(selectedItemContent);
                            break;
                        } else {
                            options = selectedItemContent;
                        }
                    }
                }
            )
        );
    }
};

export default feature;