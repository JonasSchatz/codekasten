import * as md5 from 'md5';
import * as vscode from 'vscode';

import { NoteGraph } from '../core';
import { MarkdownLink } from '../core/Link';
import { replaceTextInFile } from '../vscode/NoteActions';

import { Logger } from './logger';

export class FilesystemSyncher{

    graph: NoteGraph;

    constructor(graph: NoteGraph) {
        this.graph = graph;
    }

    /**
     * Handels the renaming of forward- and backlinks in the markdown files
     * The changes in the NoteGraph will be made by the respective onDidChange events.
     */
    async onWillRename(event: vscode.FileRenameEvent) {
        for(const file of event.files){

            const oldId = md5(file.oldUri.fsPath);
            const newId = md5(file.newUri.fsPath);
            Logger.info(`Renaming file from ${file.oldUri.fsPath} to ${file.newUri.fsPath}`);
            
            // Adjust forward links: They have a new source
            const forwardLinkTargets: string[] = this.graph.getForwardLinksAsString(oldId);
            for(const forwardLinkTarget of forwardLinkTargets){
                const oldRelativePath: string = new MarkdownLink(file.oldUri.fsPath, forwardLinkTarget).relativePath;
                const newRelativePath: string = new MarkdownLink(file.newUri.fsPath, forwardLinkTarget).relativePath;
                if(oldRelativePath !== newRelativePath){
                    Logger.info(`Renaming file, need to adjust forward link from ${oldRelativePath} to ${newRelativePath}`);
                    if (!await replaceTextInFile(file.newUri.fsPath, oldRelativePath, newRelativePath)) {
                        if (!await replaceTextInFile(file.newUri.fsPath, oldRelativePath.replace(/\//g, '\\'), newRelativePath)) {
                            Logger.warn(`Could not find text to replace in ${file.newUri.fsPath}`);
                        }
                    }
                }
            }
            
            // Adjust backlinks: They have a new target
            const backLinkTargets: string[] = this.graph.getBacklinksAsString(oldId);
            for(const backLinkTarget of backLinkTargets){
                const oldRelativePath: string = new MarkdownLink(backLinkTarget, file.oldUri.fsPath).relativePath;
                const newRelativePath: string = new MarkdownLink(backLinkTarget, file.newUri.fsPath).relativePath;
                if(oldRelativePath !== newRelativePath){
                    Logger.info(`Renaming file, need to adjust backlink from ${oldRelativePath} to ${newRelativePath}`);
                    if(!await replaceTextInFile(backLinkTarget, oldRelativePath, newRelativePath)) {
                        if(!await replaceTextInFile(backLinkTarget, oldRelativePath.replace(/\//g, '\\'), newRelativePath)){
                            Logger.warn(`Could not find text to replace in ${backLinkTarget}`);
                        }
                    }
                }
            }
            Logger.info(`---`);
        }
    }
}
