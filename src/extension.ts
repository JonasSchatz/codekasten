import * as fs from 'fs';
import * as md5 from 'md5';
import * as vscode from 'vscode';

import { CodekastenParser, NoteGraph, Logger } from "./core";
import { features } from "./features";
import { VscodeConfig, VscodeLogger } from "./vscode";
import { FilesystemSyncher } from './vscode/FilesystemSyncher';


export async function activate(context: vscode.ExtensionContext) {
	Logger.setDefaultLogger(new VscodeLogger);
	setupFolders();
    const parser: CodekastenParser = new CodekastenParser();
    const codekastenGraph: NoteGraph = await setupCodekastenGraph(parser);
    setupFileCallbacks(codekastenGraph, parser);
	
	features.forEach(f => {
		f.activate(context, codekastenGraph);
	});
}

export function deactivate() {}


function setupFolders() {
    for (let [key, value] of Object.entries(VscodeConfig.folders)) {
        if (!fs.existsSync(value)) {
            fs.mkdir(value, error => Logger.error(`Error creating non-existing folder ${value}: ${error}`));
        }
    }
}

async function setupCodekastenGraph(parser:CodekastenParser): Promise<NoteGraph> {
    const codekastenGraph: NoteGraph = new NoteGraph();
    
    await codekastenGraph.populateGraph(
        (await vscode.workspace.findFiles('**/*.md', '{.codekasten, ./index.md}')).map(uri => uri.fsPath), 
        parser
    );
    Logger.info(`Loaded ${codekastenGraph.graph.nodeCount()} Notes and ${codekastenGraph.graph.edgeCount()} Links`);
    return codekastenGraph;
}

function setupFileCallbacks(codekastenGraph: NoteGraph, parser: CodekastenParser) {
    const watcher: vscode.FileSystemWatcher = vscode.workspace.createFileSystemWatcher("**/*.md");
    const filesystemSyncher: FilesystemSyncher = new FilesystemSyncher(codekastenGraph);

    watcher.onDidCreate(async uri => {
        Logger.info(`Created a file: ${uri.fsPath}`);
        codekastenGraph.setNote(await parser.parse(uri.fsPath));
    });

    watcher.onDidChange(async uri => {
        Logger.info(`Changed a file: ${uri.fsPath}`);
        codekastenGraph.setNote(await parser.parse(uri.fsPath));
    });

    watcher.onDidDelete(uri => {
        Logger.info(`Deleted a file: ${uri.fsPath}`);
        codekastenGraph.deleteNote(md5(uri.fsPath));
    });

    vscode.workspace.onWillRenameFiles(async event => {
        await filesystemSyncher.onWillRename(event);
    });
}