import * as fs from 'fs';
import * as path from "path";
import * as vscode from 'vscode';

import { Note, NoteGraph, Logger } from "../core";
import { config } from "../services";
import { appendTag } from '../vscode/NoteActions';

import { Feature } from "./feature";


const feature: Feature = {
    activate: (context: vscode.ExtensionContext, graph: NoteGraph) => {
        context.subscriptions.push(
            vscode.commands.registerCommand(
                'codekasten.perform-consistency-check', 
                async () => {
                    checkImages(graph);
                }
            )
        );
    }
};


async function checkImages(graph: NoteGraph) {

    const availableImagePaths: Set<string> = new Set(fs.readdirSync(config.folders.imagesFolder).map(filename => path.join(config.folders.imagesFolder, filename)));

    var linkedImagePaths: Set<string> = new Set();
    for(const nodeID of graph.graph.nodes()) {
        const note: Note = graph.getNote(nodeID);
        for (const imagePath of note.images) {
            linkedImagePaths.add(imagePath);

            if (!availableImagePaths.has(imagePath)) {
                const noteTaggingSuccessful: boolean = await appendTag(note.path, `${config.tags.failedConsistencyCheckTag} ${config.tags.missingImageTag} `);
                if (noteTaggingSuccessful) {
                    Logger.info(`Did not find file ${imagePath} in ${note.path}`);
                } else {
                    Logger.error(`Did not find file ${imagePath} in ${note.path}, tagging unsuccessful!`);
                }
                
            }
        }
    }

    for (const availableImagePath of availableImagePaths) {
        if (!linkedImagePaths.has(availableImagePath)) {
            Logger.error(`File ${availableImagePath} not used in any note, moving to recyclebin`);
            
            fs.rename(
                availableImagePath, 
                path.join(config.folders.recycleFolder, path.basename(availableImagePath)), 
                error => Logger.error(error));
        }
    }
}

export default feature;