import * as vscode from 'vscode';
import { features } from "./features";
import { Config, createConfigFromVsCode, NoteGraph } from "./core";
import { CodekastenParser } from "./vscode";
import { checkCodekastenSetup } from './vscode/Verification';


export async function activate(context: vscode.ExtensionContext) {

	const config: Config = createConfigFromVsCode();
	const parser: CodekastenParser = new CodekastenParser();
	const codekastenGraph: NoteGraph = new NoteGraph();
	await codekastenGraph.populateGraph(vscode.workspace.findFiles('**/*.md', '.codekasten'), parser);

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
