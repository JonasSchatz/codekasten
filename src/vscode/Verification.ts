import * as vscode from 'vscode';
import { CodekastenError } from '../core/CodekastenError';

export async function checkCodekastenSetup() {
    const templateUris: vscode.Uri[] = await vscode.workspace.findFiles('.codekasten/templates/**.md');
    if (templateUris.length === 0) {
        throw new CodekastenError('Could not find any Templates!');
    }

}