import * as md5 from 'md5';
import * as vscode from 'vscode';

import { NoteGraph } from "../core";
import { Logger } from '../services';
import { CodekastenParser } from "../vscode";
import { FilesystemSyncher } from './filesystemSyncher';

export const bootstrap = async(): Promise<NoteGraph> => {
    const watcher: vscode.FileSystemWatcher = vscode.workspace.createFileSystemWatcher("**/*.md");
    const parser: CodekastenParser = new CodekastenParser();
    const codekastenGraph: NoteGraph = new NoteGraph();
    await codekastenGraph.populateGraph(vscode.workspace.findFiles('**/*.md', '{.codekasten, ./index.md}'), parser);
    Logger.info(`Loaded ${codekastenGraph.graph.nodeCount()} Notes and ${codekastenGraph.graph.edgeCount()} Links`);

    const filesystemSyncher: FilesystemSyncher = new FilesystemSyncher(codekastenGraph);

    watcher.onDidCreate(async uri => {
        Logger.info(`Created a file: ${uri.fsPath}`);
        codekastenGraph.setNote(await parser.parse(uri));
    });

    watcher.onDidChange(async uri => {
        Logger.info(`Changed a file: ${uri.fsPath}`);
        codekastenGraph.setNote(await parser.parse(uri));
    });

    watcher.onDidDelete(uri => {
        Logger.info(`Deleted a file: ${uri.fsPath}`);
        codekastenGraph.deleteNote(md5(uri.fsPath));
    });

    vscode.workspace.onWillRenameFiles(async event => {
        await filesystemSyncher.onWillRename(event);
    });

    vscode.workspace.onDidRenameFiles(event => {

    });

    return codekastenGraph;
};