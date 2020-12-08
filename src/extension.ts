import * as vscode from 'vscode';
import { features } from "./features";
import { Config, createConfigFromVsCode, NoteGraph } from "./core";
import { CodekastenParser } from "./vscode";
import { checkCodekastenSetup } from './vscode/Verification';
import { bootstrap } from './services/bootstrap';


export async function activate(context: vscode.ExtensionContext) {

	const config: Config = createConfigFromVsCode();
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
