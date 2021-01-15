import * as vscode from 'vscode';

import { NoteGraph } from "./core";
import { features } from "./features";
import { bootstrap, CodekastenLogger, Logger } from './services';



export async function activate(context: vscode.ExtensionContext) {
	Logger.setDefaultLogger(new CodekastenLogger);
	const codekastenGraph: NoteGraph = await bootstrap();
	
	features.forEach(f => {
		f.activate(context, codekastenGraph);
	});
}

export function deactivate() {}
