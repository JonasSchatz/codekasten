import * as vscode from "vscode";
import { NoteGraph } from "../core";
import { Feature } from "./feature";

const feature: Feature = {
    activate: (context: vscode.ExtensionContext, graph: NoteGraph) => {
        context.subscriptions.push(
            vscode.commands.registerCommand("codekasten.show-graph", async () => {
                const panel = vscode.window.createWebviewPanel(
                    "note-graph", 
                    "Notes", 
                    vscode.ViewColumn.Two,
                    {
                        enableScripts: true,
                        retainContextWhenHidden: true
                    }
                );
            })
        );
    }
};

export default feature;