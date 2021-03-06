import * as fs from 'fs';
import * as md5 from "md5";
import * as path from 'path';
import * as vscode from "vscode";

import { NoteGraph, Logger } from "../core";
import { Note, WebviewNote } from "../core/note";
import { openNoteInWorkspace } from "../vscode/note-actions";

import { Feature } from "./feature";


const feature: Feature = {
    activate: (context: vscode.ExtensionContext, graph: NoteGraph) => {
        var panel: vscode.WebviewPanel;

        context.subscriptions.push(
            vscode.commands.registerCommand("codekasten.show-graph", async () => {
                panel = initializeWebviewPanel(context, graph);

                const noteAddedListener = graph.onDidAddNote(() => sendGraph(graph, panel, "update"));
                const noteUpdatedListener = graph.onDidUpdateNote(() => sendGraph(graph, panel, "update"));
                const noteDeleteListener = graph.onDidDeleteNote(() => sendGraph(graph, panel, "update"));

                panel.onDidDispose(() => {
                    noteAddedListener.dispose();
                    noteUpdatedListener.dispose();
                    noteDeleteListener.dispose();
                });

                vscode.window.onDidChangeActiveTextEditor((editor) => {
                    if (editor.document.uri.scheme === "file") {
                        Logger.info(`About to update GraphViz: Selected Note ${editor.document.uri.fsPath}`);
                        panel.webview.postMessage({
                            type: "didSelectNote", 
                            payload: md5(editor.document.uri.fsPath)
                        });
                    }
                });

                vscode.workspace.onDidChangeConfiguration( event => {
                    sendSettings(panel, "updateSettings");
                });

                
            })  
        );

        context.subscriptions.push(
            vscode.commands.registerCommand("codekasten.refresh-graph", () => {
                sendGraph(graph, panel, "refresh");
            })
        );
    }
};

function sendGraph(graph: NoteGraph, panel: vscode.WebviewPanel, messageType: string) {
    const webviewData = generateWebviewData(graph);
    panel.webview.postMessage({
        type: messageType, 
        payload: webviewData
    });
};

function sendSettings(panel: vscode.WebviewPanel, messageType: string) {
    const graphViewSettings: vscode.WorkspaceConfiguration = vscode.workspace.getConfiguration('codekasten').get('graphView');
    panel.webview.postMessage({
        type: messageType,
        payload: graphViewSettings
    });
}

/**
 * Turn the NoteGraph into a list of nodes and links for force-graph to consume
 */
function generateWebviewData(graph: NoteGraph) {
    const webviewNodes: WebviewNote[] = [];
    const webviewLinks: { source: string; target: string; targetIsStub: boolean }[] = [];

    graph.graph.nodes().forEach(id => {
        const sourceNote: Note = graph.getNote(id);

        webviewNodes.push({
            'id': md5(sourceNote.path), 
            'label': sourceNote.title ? sourceNote.title : path.basename(sourceNote.path, path.extname(sourceNote.path)), 
            'path': sourceNote.path, 
            'isStub': sourceNote.isStub, 
            'tags': sourceNote.tags
        });

        for (const link of sourceNote.links) {
            const targetNote: Note = graph.getNote(md5(link));
            webviewLinks.push( { 
                'source': id, 
                'target': md5(link), 
                'targetIsStub': targetNote.isStub
            });
        }
    });

    const webviewData = {
        'nodes': webviewNodes, 
        'links': webviewLinks
    };

    // Debug: Write the data to a file
    //fs.writeFileSync(path.resolve(__dirname, '../..', 'static', 'test_data_autogenerated'), JSON.stringify(webviewData));
    return webviewData;
}


function initializeWebviewPanel(context: vscode.ExtensionContext, graph: NoteGraph) {
    const panel = vscode.window.createWebviewPanel(
        "note-graph", 
        "Notes", 
        vscode.ViewColumn.Two,
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    panel.webview.html = getWebviewContent(context, panel);

    panel.webview.onDidReceiveMessage(
        message => {
            console.log(message.type);

            if (message.type === "click") {
                console.log(message.payload);
                openNoteInWorkspace(message.payload.path, vscode.ViewColumn.One);
            }

            if (message.type === 'webviewDidLoad') {
                //sendSettings(panel, "updateSettings");
                sendGraph(graph, panel, "initial");
            }
        }, 
        undefined, 
        context.subscriptions
    );
    
    return panel;
}

/**
 * Replace the placeholders in the HTML with the vscode-webview-resource URIs
 */
function getWebviewContent(context: vscode.ExtensionContext, panel: vscode.WebviewPanel) {

    const webviewUri = (fileName: string) => 
        panel.webview.asWebviewUri(
            vscode.Uri.file(path.join(context.extensionPath, "static", fileName))
        ).toString();

    const webviewContentUri: vscode.Uri = vscode.Uri.file(path.join(context.extensionPath, 'static', 'dataviz.html'));
    const text: string = fs.readFileSync(webviewContentUri.fsPath, 'utf-8');

    const textWithVariables = text
        .replace(new RegExp(/(?<=data-replace src=")([^"]*)"/, 'g'), '{{$1}}"')
        .replace(new RegExp(/(?<=data-replace href=")([^"]*)"/, 'g'), '{{$1}}"');

    const filled = textWithVariables.replace(/\{\{.*\}\}/g, (match) => {
        const fileName = match.slice(2, -2).trim();
        return webviewUri(fileName);
      });
    return filled;
};

export default feature;