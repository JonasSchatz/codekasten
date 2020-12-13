import * as fs from 'fs';
import * as md5 from "md5";
import * as path from 'path';
import { TextDecoder } from "util";
import * as vscode from "vscode";

import { NoteGraph } from "../core";
import { Note, WebviewNote } from "../core/Note";
import { openNoteInWorkspace } from "../vscode/NoteActions";

import { Feature } from "./feature";


const feature: Feature = {
    activate: (context: vscode.ExtensionContext, graph: NoteGraph) => {
        var panel: vscode.WebviewPanel;

        context.subscriptions.push(
            vscode.commands.registerCommand("codekasten.show-graph", async () => {
                panel = await initializeWebviewPanel(context, graph);

                const noteAddedListener = graph.onDidAddNote(() => sendGraph(graph, panel, 'Webview update, onDidAddNote'));
                const noteUpdatedListener = graph.onDidUpdateNote(() => sendGraph(graph, panel, 'Webview update, onDidUpdateNote'));
                const noteDeleteListener = graph.onDidDeleteNote(() => sendGraph(graph, panel, 'Webview update, onDidDeleteNote'));
                vscode.window.onDidChangeActiveTextEditor((editor) => sendGraph(graph, panel, `Webview update, onDidChangeActiveTextEditor ${editor.document?.uri.fsPath}`));

                panel.onDidDispose(() => {
                    noteAddedListener.dispose();
                    noteUpdatedListener.dispose();
                    noteDeleteListener.dispose();
                });
            })
        );

        context.subscriptions.push(
            vscode.commands.registerCommand("codekasten.update-graph", () => {
                sendGraph(graph, panel, 'Webview update, manual trigger');
            })
        );
    }
};


function sendGraph(graph: NoteGraph, panel: vscode.WebviewPanel, debugMessage: string) {
    console.log(debugMessage);
    const webviewData = generateWebviewData(graph);
    panel.webview.postMessage({
        type: "refresh", 
        payload: webviewData
    });
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

    panel.webview.html = await generateWebviewHtml(context, panel);

    panel.webview.onDidReceiveMessage(
        message => {
            console.log(message.type);

            if (message.type === "click") {
                console.log(message.payload);
                openNoteInWorkspace(message.payload.path, vscode.ViewColumn.One);
            }

            if (message.type === 'ready') {
                sendGraph(graph, panel, 'Webview update, initial');
            }
        }, 
        undefined, 
        context.subscriptions
    );
    
    return panel;
}


/**
 * Replaces the placeholders in the HTML template file with the respective files at the extensionPath
 */
async function generateWebviewHtml(context: vscode.ExtensionContext, panel: vscode.WebviewPanel) {
    const webviewContentPath = vscode.Uri.file(path.join(context.extensionPath, 'static', 'dataviz.html'));
    const file = await vscode.workspace.fs.readFile(webviewContentPath);
    const text = new TextDecoder('utf-8').decode(file);

    const webviewUri = (fileName: string) => 
        panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(context.extensionPath, "static", fileName))
        ).toString();
        
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
    return filled;
}

/**
 * Turn the NoteGraph into a list of nodes and edges for D3 to consume
 */
function generateWebviewData(graph: NoteGraph) {
    const webviewNodes: WebviewNote[] = [];
    const webviewEdges: { source: string; target: string; targetIsStub: boolean }[] = [];
    const currentlyOpenNotePath: string = vscode.window.activeTextEditor?.document?.uri.fsPath;
    console.log(`This should be identical: ${currentlyOpenNotePath}`)

    graph.graph.nodes().forEach(id => {
        const sourceNote: Note = graph.getNote(id);

        webviewNodes.push({
            'id': md5(sourceNote.path), 
            'label': sourceNote.title ? sourceNote.title : path.basename(sourceNote.path, path.extname(sourceNote.path)), 
            'path': sourceNote.path, 
            'isStub': sourceNote.isStub, 
            'isCurrentlyActive': (sourceNote.path === currentlyOpenNotePath) ? true : false
        });

        for (const link of sourceNote.links) {
            const targetNote: Note = graph.getNote(md5(link));
            webviewEdges.push( { 
                'source': id, 
                'target': md5(link), 
                'targetIsStub': targetNote.isStub
            });
        }
    });

    const webviewData = {
        'nodes': webviewNodes, 
        'edges': webviewEdges
    };

    // Debug: Write the data to a file
    //fs.writeFileSync(path.resolve(__dirname, '../..', 'static', 'test_data_autogenerated'), JSON.stringify(webviewData));

    return webviewData;
}

export default feature;