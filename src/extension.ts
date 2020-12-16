import * as vscode from 'vscode';

import { NoteGraph } from "./core";
import { features } from "./features";
import { bootstrap, CodekastenLogger, Logger } from './services';
import { checkCodekastenSetup } from './vscode/Verification';



export async function activate(context: vscode.ExtensionContext) {
	Logger.setDefaultLogger(new CodekastenLogger);
	const codekastenGraph: NoteGraph = await bootstrap();
	

	try {
		await checkCodekastenSetup();
	} 
	catch (e) {
		vscode.window.showErrorMessage(e.message);
	}

	features.forEach(f => {
		f.activate(context, codekastenGraph);
	});
}

export function deactivate() {}
