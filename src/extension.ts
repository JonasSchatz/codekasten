import * as vscode from 'vscode';

import { NoteGraph, Logger } from "./core";
import { features } from "./features";
import { bootstrap} from './services';
import { VscodeLogger } from "./vscode";


export async function activate(context: vscode.ExtensionContext) {
	Logger.setDefaultLogger(new VscodeLogger);
	const codekastenGraph: NoteGraph = await bootstrap();
	
	features.forEach(f => {
		f.activate(context, codekastenGraph);
	});
}

export function deactivate() {}
