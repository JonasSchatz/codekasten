import * as path from 'path';
import * as vscode from 'vscode';

import { Config } from "../core";

const codekastenFolder: string = '.codekasten';
const rootFolder: string = vscode.workspace.workspaceFolders[0]?.uri.fsPath; 

export const VscodeConfig: Config = {
    folders: {
        imagesFolder: path.join(rootFolder, 'images'),
        notesFolder: path.join(rootFolder, 'notes'),
        recycleFolder: path.join(rootFolder, codekastenFolder, 'recyclebin'),
        templatesFolder: path.join(rootFolder, codekastenFolder, 'templates'),
    }, 
    tags: {
        failedConsistencyCheckTag: '#consistency',
        missingImageTag: '#missingImage',
    }
};