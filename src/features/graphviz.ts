import * as vscode from "vscode";
import { NoteGraph } from "../core";
import * as path from 'path';
import * as fs from 'fs';
import { Feature } from "./feature";
import { TextDecoder } from "util";
import { Note } from "../core/Note";
import * as md5 from "md5";
import { openNoteInWorkspace } from "../vscode/NoteActions";

const feature: Feature = {
    activate: (context: vscode.ExtensionContext, graph: NoteGraph) => {
        var panel: vscode.WebviewPanel;
        context.subscriptions.push(
            vscode.commands.registerCommand("codekasten.show-graph", async () => {
                panel = await initializeWebviewPanel(context, graph);
            })
        );
        context.subscriptions.push(
            vscode.commands.registerCommand("codekasten.update-graph", () => {
                updateGraph(panel, graph);
            })
        );
    }
};

async function initializeWebviewPanel(context: vscode.ExtensionContext, graph: NoteGraph) {
    const panel = vscode.window.createWebviewPanel(
        "note-graph", 
        "Notes", 
        vscode.ViewColumn.Two,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    panel.webview.html = await getWebviewContent(context, panel);

    panel.webview.onDidReceiveMessage(
        message => {
            console.log(message.type);

            if (message.type === "click") {
                console.log(message.payload);
                openNoteInWorkspace(message.payload.path);
                
            }
        }, 
        undefined, 
        context.subscriptions
    );
    
    return panel;
}



async function getWebviewContent(context: vscode.ExtensionContext, panel: vscode.WebviewPanel) {
    const webviewContentPath = vscode.Uri.file(path.join(context.extensionPath, 'static', 'dataviz.html'));
    const file = await vscode.workspace.fs.readFile(webviewContentPath);
    const text = new TextDecoder('utf-8').decode(file);

    const webviewUri = (fileName: string) => 
        panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(context.extensionPath, "static", fileName))
        ).toString();

    // Replace variables in HTML
    const textWithVariables = text.replace(
        "${graphPath}", 
        "{{./graph.js}}"
    ).replace(
        "${graphStylesPath}", 
        "{{./graph.css}}"
    );

    const filled = textWithVariables.replace(/\{\{.*\}\}/g, (match) => {
        const fileName = match.slice(2, -2).trim();
        return webviewUri(fileName);
      });
    console.log(filled);
    return filled;
}

function updateGraph(panel: vscode.WebviewPanel, graph: NoteGraph) {
    const webviewData = generateWebviewData(graph);
    panel.webview.postMessage({
        type: "refresh", 
        payload: webviewData
    });

    
}

function generateWebviewData(graph: NoteGraph) {
    const webviewNodes: { id: string; label: string; path: string }[] = [];
    const webviewEdges: { source: string; target: string; }[] = [];

    graph.graph.nodes().forEach(id => {
        const note: Note = graph.graph.node(id);
        webviewNodes.push({'id': md5(note.path), 'label': note.title, 'path': note.path});

        for (const link of note.links) {
            webviewEdges.push( { 'source': md5(link.source), 'target': md5(link.target)});
        }

    });


    const webviewData = {
        'nodes': webviewNodes, 
        'edges': webviewEdges
    };

    const writeBytes = Buffer.from(JSON.stringify(webviewData), 'utf8');
    fs.writeFileSync(path.resolve(__dirname, '../..', 'static', 'test_data_autogenerated.js'), JSON.stringify(webviewData));

    return webviewData;
}


export default feature;