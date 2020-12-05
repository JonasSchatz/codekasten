import * as vscode from "vscode";
import { NoteGraph } from "../core";
import * as path from 'path';
import { Feature } from "./feature";
import { TextDecoder } from "util";
import { Note } from "../core/Note";

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
        "{{graph.js}}"
    ).replace(
        "${graphStylePath}", 
        "{{graph.css}}"
    ).replace(
        /<script data-replace src="([^"]+")/g,
        match => {
            const fileName = match.slice('<script data-replace src="'.length, -1).trim();
            return '<script src="' + webviewUri(fileName) + '"';
        }
    );
    console.log(textWithVariables);
    return textWithVariables;
}

function updateGraph(panel: vscode.WebviewPanel, graph: NoteGraph) {
    const webviewData = generateWebviewData(graph);
    panel.webview.postMessage({
        type: "didUpdateData", 
        payload: webviewData
    });

    
}

function generateWebviewData(graph: NoteGraph) {
    const webviewNodes: {[index: string]:any} = {};
    const webviewEdges: {[index: string]:any} = {};

    graph.graph.nodes().forEach(id => {
        const note: Note = graph.graph.node(id);
        webviewNodes[id] = {
            id: id, 
            title: note.title
        };
    });


    const webviewData = {
        nodes: webviewNodes, 
        edges: webviewEdges
    };
    return webviewData;
}


export default feature;