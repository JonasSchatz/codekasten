import * as vscode from 'vscode';
import { NoteGraph } from '../core';
import * as md5 from 'md5';
import { MarkdownLink } from '../core/Link';
import { escapeRegex, replaceTextInFile } from '../vscode/NoteActions';

export class FilesystemSyncher{

    graph: NoteGraph;

    constructor(graph: NoteGraph) {
        this.graph = graph;
    }

    onDidRename(event: vscode.FileRenameEvent) {
        for(const file of event.files){
            const oldId = md5(file.oldUri.fsPath);
            const newId = md5(file.newUri.fsPath);
            
            this.graph.updateId(oldId, newId);

            for(const id of this.graph.graph.nodes()){
                const node = this.graph.getNote(id);
                if (node.path.includes('python')){
                    console.log(node.path);
                }
                console.log(node.path);
            }

            // Adjust forward links: They have a new source
            const forwardLinkTargets: string[] = this.graph.getForwardLinksAsString(newId);
            for(const forwardLinkTarget of forwardLinkTargets){
                const oldRelativePath: string = new MarkdownLink(file.oldUri.fsPath, forwardLinkTarget).relativePath;
                const newRelativePath: string = new MarkdownLink(file.newUri.fsPath, forwardLinkTarget).relativePath;
                if(oldRelativePath !== newRelativePath){
                    replaceTextInFile(file.newUri.fsPath, oldRelativePath, newRelativePath);
                    replaceTextInFile(file.newUri.fsPath, oldRelativePath.replace(/\//g, '\\'), newRelativePath); // we might need to replace old links with backslashes
                }
                
            }
            
            // Adjust backlinks: They have a new target
            const backLinkTargets: string[] = this.graph.getBacklinksAsString(newId);
            for(const backLinkTarget of backLinkTargets){
                const oldRelativePath: string = new MarkdownLink(backLinkTarget, file.oldUri.fsPath).relativePath;
                const newRelativePath: string = new MarkdownLink(backLinkTarget, file.newUri.fsPath).relativePath;
                if(oldRelativePath !== newRelativePath){
                    replaceTextInFile(backLinkTarget, oldRelativePath, newRelativePath);
                    replaceTextInFile(backLinkTarget, oldRelativePath.replace(/\//g, '\\'), newRelativePath); // we might need to replace old links with backslashes
                }
            }
        }
    }
}
