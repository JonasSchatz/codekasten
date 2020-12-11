import * as md5 from 'md5';
import * as vscode from 'vscode';
import { NoteGraph } from "../core";
import { CodekastenParser } from "../vscode";
import { FilesystemSyncher } from './filesystemSyncher';

export const bootstrap = async(): Promise<NoteGraph> => {
    const watcher = vscode.workspace.createFileSystemWatcher("**/*.md");
    const parser: CodekastenParser = new CodekastenParser();
    const codekastenGraph: NoteGraph = new NoteGraph();
    await codekastenGraph.populateGraph(vscode.workspace.findFiles('**/*.md', '{.codekasten, ./index.md}'), parser);
    const filesystemSyncher: FilesystemSyncher = new FilesystemSyncher(codekastenGraph);

    watcher.onDidCreate(async uri => {
        codekastenGraph.setNote(await parser.parse(uri));
    });

    watcher.onDidChange(async uri => {
        codekastenGraph.setNote(await parser.parse(uri));
    });

    watcher.onDidDelete(uri => {
        codekastenGraph.deleteNote(md5(uri.fsPath));
    });

    vscode.workspace.onDidRenameFiles(event => {
        console.log('File Rename Event!');
        filesystemSyncher.onDidRename(event);
    });

    return codekastenGraph;
};